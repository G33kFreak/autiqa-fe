<script setup lang="ts">
import type { CarDto } from '#shared/dto/car.dto';
import type { CreateCarDto } from '#shared/dto/create-car.dto';

const { t } = useI18n();
const carsStore = useCarsStore();

const emit = defineEmits<{ created: [car: CarDto] }>();

const dialog = ref<HTMLDialogElement | null>(null);
const modelInput = ref<HTMLInputElement | null>(null);

interface FormState {
  model: string;
  plateNumber: string;
  vin: string;
  inspectionValidUntil: string;
}

function emptyForm(): FormState {
  return {
    model: '',
    plateNumber: '',
    vin: '',
    inspectionValidUntil: '',
  };
}

const form = reactive<FormState>(emptyForm());
const modelError = ref(false);
const submitError = ref('');
const saving = ref(false);
/** Name of the car just added via "Save & add another" — a brief inline confirmation. */
const justAdded = ref('');
/** How many cars this session of the dialog has added (for the running tally). */
const addedThisSession = ref(0);

const modelValid = computed(() => form.model.trim().length > 0);

function resetForm() {
  Object.assign(form, emptyForm());
  modelError.value = false;
  submitError.value = '';
}

function open() {
  resetForm();
  justAdded.value = '';
  addedThisSession.value = 0;
  dialog.value?.showModal();
  nextTick(() => modelInput.value?.focus());
}

function close() {
  dialog.value?.close();
}

/** Native close (Escape, form method=dialog, .close()) — clear transient state. */
function onClose() {
  justAdded.value = '';
}

/** Close only when the backdrop (the dialog element itself) is clicked. */
function onDialogClick(event: MouseEvent) {
  if (event.target === dialog.value) close();
}

/** Uppercase plate and VIN as the operator types — these are always uppercase. */
function onUpper(key: 'plateNumber' | 'vin', event: Event) {
  form[key] = (event.target as HTMLInputElement).value.toUpperCase();
}

function buildPayload(): CreateCarDto {
  const payload: CreateCarDto = { model: form.model.trim() };
  const plate = form.plateNumber.trim();
  const vin = form.vin.trim();
  if (plate) payload.plateNumber = plate;
  if (vin) payload.vin = vin;
  if (form.inspectionValidUntil) payload.inspectionValidUntil = form.inspectionValidUntil;
  return payload;
}

async function save(): Promise<CarDto | null> {
  submitError.value = '';
  if (!modelValid.value) {
    modelError.value = true;
    modelInput.value?.focus();
    return null;
  }

  saving.value = true;
  try {
    const created = await carsStore.createCar(buildPayload());
    emit('created', created);
    addedThisSession.value += 1;
    return created;
  } catch {
    submitError.value = t('app.fleet.dialog.error');
    return null;
  } finally {
    saving.value = false;
  }
}

/** Primary action: save and close. */
async function onSubmit() {
  const created = await save();
  if (created) close();
}

/** Secondary action: save, keep the dialog open, and reset for the next car. */
async function onSaveAndAddAnother() {
  const created = await save();
  if (!created) return;
  justAdded.value = created.model;
  resetForm();
  nextTick(() => modelInput.value?.focus());
}

defineExpose({ open, close });
</script>

<template>
  <dialog
    ref="dialog"
    class="vd"
    aria-labelledby="vd-title"
    @click="onDialogClick"
    @close="onClose"
  >
    <div class="vd__panel">
      <header class="vd__head">
        <span class="vd__head-icon" aria-hidden="true">
          <AppIcon name="car" :size="22" />
        </span>
        <div class="vd__head-copy">
          <h2 id="vd-title" class="vd__title">{{ t('app.fleet.dialog.title') }}</h2>
          <p class="vd__subtitle">{{ t('app.fleet.dialog.subtitle') }}</p>
        </div>
        <button
          type="button"
          class="vd__close"
          :aria-label="t('app.fleet.dialog.close')"
          @click="close"
        >
          <AppIcon name="close" :size="20" />
        </button>
      </header>

      <form class="vd__form" novalidate :aria-busy="saving" @submit.prevent="onSubmit">
        <Transition name="vd-slide">
          <p v-if="submitError" class="vd__banner vd__banner--error" role="alert">
            <AppIcon name="alert" :size="16" />
            <span>{{ submitError }}</span>
          </p>
        </Transition>

        <Transition name="vd-slide">
          <p v-if="justAdded" class="vd__banner vd__banner--ok" role="status">
            <AppIcon name="check" :size="16" />
            <span>{{ t('app.fleet.dialog.added', { model: justAdded }) }}</span>
          </p>
        </Transition>

        <div class="vd__field">
          <label class="vd__label" for="vd-model">
            {{ t('app.fleet.dialog.modelLabel') }}
            <span class="vd__req" aria-hidden="true">*</span>
          </label>
          <input
            id="vd-model"
            ref="modelInput"
            v-model="form.model"
            type="text"
            class="vd__input"
            :class="{ 'vd__input--error': modelError }"
            :placeholder="t('app.fleet.dialog.modelPlaceholder')"
            :aria-invalid="modelError"
            autocomplete="off"
            maxlength="80"
            :disabled="saving"
            @input="modelError = false"
          >
          <p v-if="modelError" class="vd__hint vd__hint--error">
            {{ t('app.fleet.dialog.modelRequired') }}
          </p>
        </div>

        <div class="vd__row">
          <div class="vd__field">
            <label class="vd__label" for="vd-plate">{{ t('app.fleet.dialog.plateLabel') }}</label>
            <input
              id="vd-plate"
              :value="form.plateNumber"
              type="text"
              class="vd__input vd__input--mono"
              :placeholder="t('app.fleet.dialog.platePlaceholder')"
              autocomplete="off"
              maxlength="16"
              :disabled="saving"
              @input="onUpper('plateNumber', $event)"
            >
          </div>
          <div class="vd__field">
            <label class="vd__label" for="vd-vin">{{ t('app.fleet.dialog.vinLabel') }}</label>
            <input
              id="vd-vin"
              :value="form.vin"
              type="text"
              class="vd__input vd__input--mono"
              :placeholder="t('app.fleet.dialog.vinPlaceholder')"
              autocomplete="off"
              maxlength="17"
              :disabled="saving"
              @input="onUpper('vin', $event)"
            >
          </div>
        </div>

        <div class="vd__field">
          <label class="vd__label" for="vd-inspection">{{ t('app.fleet.dialog.inspectionLabel') }}</label>
          <input
            id="vd-inspection"
            v-model="form.inspectionValidUntil"
            type="date"
            class="vd__input"
            :disabled="saving"
          >
        </div>

        <p class="vd__note">{{ t('app.fleet.dialog.optionalNote') }}</p>

        <footer class="vd__foot">
          <span v-if="addedThisSession > 0" class="vd__tally">
            {{ t('app.fleet.dialog.tally', { n: addedThisSession }) }}
          </span>
          <div class="vd__actions">
            <button
              type="button"
              class="vd__btn vd__btn--ghost"
              :disabled="saving"
              @click="onSaveAndAddAnother"
            >
              {{ t('app.fleet.dialog.addAnother') }}
            </button>
            <button
              type="submit"
              class="vd__btn vd__btn--primary"
              :disabled="saving"
            >
              <span v-if="!saving">{{ t('app.fleet.dialog.submit') }}</span>
              <span v-else class="vd__spinner" aria-hidden="true" />
              <span v-if="saving" class="vd__sr">{{ t('app.fleet.dialog.submitting') }}</span>
            </button>
          </div>
        </footer>
      </form>
    </div>
  </dialog>
</template>

<style scoped>
.vd__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

/* ── Dialog frame ─────────────────────────────────────────── */
.vd {
  width: min(92vw, 33rem);
  max-height: min(90dvh, 48rem);
  padding: 0;
  border: none;
  border-radius: var(--radius-xl);
  background: var(--color-bg);
  color: var(--color-ink);
  box-shadow: var(--shadow-float);
  overflow: visible;
}

.vd::backdrop {
  background: oklch(0.155 0.018 268 / 0.42);
  backdrop-filter: blur(2px);
}

.vd[open] {
  animation: vd-pop var(--duration-ui) var(--ease-out);
}

.vd[open]::backdrop {
  animation: vd-fade var(--duration-ui) var(--ease-out);
}

.vd__panel {
  display: flex;
  flex-direction: column;
  max-height: inherit;
}

/* ── Header ───────────────────────────────────────────────── */
.vd__head {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-6) var(--space-4);
}

.vd__head-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}

.vd__head-copy {
  flex: 1;
  min-width: 0;
}

.vd__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--color-ink);
}

.vd__subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-muted);
}

.vd__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  margin: -0.25rem -0.25rem 0 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-muted);
  transition: background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.vd__close:hover {
  background: var(--color-surface-mid);
  color: var(--color-ink);
}

.vd__close:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* ── Form ─────────────────────────────────────────────────── */
.vd__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: 0 var(--space-6) var(--space-6);
  overflow-y: auto;
}

.vd__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.vd__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}

.vd__label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-ink);
  line-height: 1;
}

.vd__req {
  color: var(--color-primary);
}

.vd__input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  background: var(--color-surface);
  border: 1.5px solid var(--color-outline);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  color: var(--color-ink);
  line-height: 1.4;
  outline: none;
  appearance: none;
  transition: border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.vd__input--mono {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.vd__input::placeholder {
  color: var(--color-muted);
  opacity: 0.55;
}

.vd__input:hover:not(:disabled) {
  border-color: oklch(0.68 0.012 268);
}

.vd__input:focus {
  border-color: var(--color-primary);
  background: var(--color-bg);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

.vd__input--error,
.vd__input--error:hover {
  border-color: var(--color-risk);
}

.vd__input--error:focus {
  box-shadow: 0 0 0 3px var(--color-risk-bg);
}

.vd__input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Calendar picker indicator inherits the muted ink. */
.vd__input[type='date']::-webkit-calendar-picker-indicator {
  opacity: 0.5;
  cursor: pointer;
}

.vd__hint {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.3;
}

.vd__hint--error {
  color: var(--color-risk);
}

.vd__note {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--color-muted);
}

/* ── Banners ──────────────────────────────────────────────── */
.vd__banner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.4;
}

.vd__banner :deep(svg) {
  flex-shrink: 0;
}

.vd__banner--error {
  background: var(--color-risk-bg);
  color: var(--color-risk);
}

.vd__banner--ok {
  background: var(--color-comply-bg);
  color: var(--color-comply);
}

/* ── Footer ───────────────────────────────────────────────── */
.vd__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-2);
  flex-wrap: wrap;
}

.vd__tally {
  font-size: 0.8125rem;
  color: var(--color-muted);
}

.vd__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}

.vd__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  padding: 0 var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.2;
  transition: background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
}

.vd__btn--ghost {
  background: var(--color-surface-mid);
  color: var(--color-ink);
}

.vd__btn--ghost:hover:not(:disabled) {
  background: var(--color-surface-high);
}

.vd__btn--primary {
  min-width: 7.5rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.vd__btn--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
  box-shadow: 0 4px 16px var(--color-primary-subtle);
}

.vd__btn:active:not(:disabled) {
  transform: scale(0.98);
}

.vd__btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.vd__btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.vd__spinner {
  width: 1.05rem;
  height: 1.05rem;
  border: 2px solid oklch(1 0 0 / 0.35);
  border-top-color: var(--color-on-primary);
  border-radius: 50%;
  animation: vd-spin 0.7s linear infinite;
}

/* ── Transitions ──────────────────────────────────────────── */
.vd-slide-enter-active,
.vd-slide-leave-active {
  transition: opacity var(--duration-ui) var(--ease-out),
    transform var(--duration-ui) var(--ease-out);
}

.vd-slide-enter-from,
.vd-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes vd-pop {
  from { opacity: 0; transform: translateY(10px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes vd-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes vd-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 540px) {
  .vd__row {
    grid-template-columns: 1fr;
  }

  .vd__head,
  .vd__form {
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }

  .vd__actions {
    width: 100%;
  }

  .vd__btn {
    flex: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .vd[open],
  .vd[open]::backdrop {
    animation: none;
  }

  .vd-slide-enter-active,
  .vd-slide-leave-active {
    transition: opacity var(--duration-fast) var(--ease-out);
  }

  .vd-slide-enter-from,
  .vd-slide-leave-to {
    transform: none;
  }

  .vd__spinner {
    animation-duration: 1.4s;
  }
}
</style>
