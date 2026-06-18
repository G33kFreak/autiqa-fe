<script setup lang="ts">
import type { DriverDto } from '#shared/dto/driver.dto';
import type { CreateDriverDto } from '#shared/dto/create-driver.dto';

const { t } = useI18n();
const driversStore = useDriversStore();

const emit = defineEmits<{ created: [driver: DriverDto] }>();

const dialog = ref<HTMLDialogElement | null>(null);
const firstNameInput = ref<HTMLInputElement | null>(null);

interface FormState {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

function emptyForm(): FormState {
  return {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
  };
}

const form = reactive<FormState>(emptyForm());
const firstNameError = ref(false);
const lastNameError = ref(false);
const emailError = ref(false);
const submitError = ref('');
const saving = ref(false);
/** Name of the driver just added via "Save & add another" — a brief inline confirmation. */
const justAdded = ref('');
/** How many drivers this session of the dialog has added (for the running tally). */
const addedThisSession = ref(0);

const firstNameValid = computed(() => form.firstName.trim().length > 0);
const lastNameValid = computed(() => form.lastName.trim().length > 0);
/** Light client-side shape check — the API is the source of truth. */
const emailValid = computed(() => {
  const value = form.email.trim();
  return value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
});

function resetForm() {
  Object.assign(form, emptyForm());
  firstNameError.value = false;
  lastNameError.value = false;
  emailError.value = false;
  submitError.value = '';
}

function open() {
  resetForm();
  justAdded.value = '';
  addedThisSession.value = 0;
  dialog.value?.showModal();
  nextTick(() => firstNameInput.value?.focus());
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

function buildPayload(): CreateDriverDto {
  const payload: CreateDriverDto = {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
  };
  const phone = form.phoneNumber.trim();
  const email = form.email.trim();
  if (phone) payload.phoneNumber = phone;
  if (email) payload.email = email;
  return payload;
}

/** Validate; focus the first offending field and return whether the form is good. */
function validate(): boolean {
  firstNameError.value = !firstNameValid.value;
  lastNameError.value = !lastNameValid.value;
  emailError.value = !emailValid.value;

  if (firstNameError.value) {
    firstNameInput.value?.focus();
    return false;
  }
  return !lastNameError.value && !emailError.value;
}

async function save(): Promise<DriverDto | null> {
  submitError.value = '';
  if (!validate()) return null;

  saving.value = true;
  try {
    const created = await driversStore.createDriver(buildPayload());
    emit('created', created);
    addedThisSession.value += 1;
    return created;
  } catch {
    submitError.value = t('app.drivers.dialog.error');
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

/** Secondary action: save, keep the dialog open, and reset for the next driver. */
async function onSaveAndAddAnother() {
  const created = await save();
  if (!created) return;
  justAdded.value = `${created.firstName} ${created.lastName}`.trim();
  resetForm();
  nextTick(() => firstNameInput.value?.focus());
}

defineExpose({ open, close });
</script>

<template>
  <dialog
    ref="dialog"
    class="dd"
    aria-labelledby="dd-title"
    @click="onDialogClick"
    @close="onClose"
  >
    <div class="dd__panel">
      <header class="dd__head">
        <span class="dd__head-icon" aria-hidden="true">
          <AppIcon name="drivers" :size="22" />
        </span>
        <div class="dd__head-copy">
          <h2 id="dd-title" class="dd__title">{{ t('app.drivers.dialog.title') }}</h2>
          <p class="dd__subtitle">{{ t('app.drivers.dialog.subtitle') }}</p>
        </div>
        <button
          type="button"
          class="dd__close"
          :aria-label="t('app.drivers.dialog.close')"
          @click="close"
        >
          <AppIcon name="close" :size="20" />
        </button>
      </header>

      <form class="dd__form" novalidate :aria-busy="saving" @submit.prevent="onSubmit">
        <Transition name="dd-slide">
          <p v-if="submitError" class="dd__banner dd__banner--error" role="alert">
            <AppIcon name="alert" :size="16" />
            <span>{{ submitError }}</span>
          </p>
        </Transition>

        <Transition name="dd-slide">
          <p v-if="justAdded" class="dd__banner dd__banner--ok" role="status">
            <AppIcon name="check" :size="16" />
            <span>{{ t('app.drivers.dialog.added', { name: justAdded }) }}</span>
          </p>
        </Transition>

        <div class="dd__row">
          <div class="dd__field">
            <label class="dd__label" for="dd-first">
              {{ t('app.drivers.dialog.firstNameLabel') }}
              <span class="dd__req" aria-hidden="true">*</span>
            </label>
            <input
              id="dd-first"
              ref="firstNameInput"
              v-model="form.firstName"
              type="text"
              class="dd__input"
              :class="{ 'dd__input--error': firstNameError }"
              :placeholder="t('app.drivers.dialog.firstNamePlaceholder')"
              :aria-invalid="firstNameError"
              autocomplete="off"
              maxlength="60"
              :disabled="saving"
              @input="firstNameError = false"
            >
            <p v-if="firstNameError" class="dd__hint dd__hint--error">
              {{ t('app.drivers.dialog.firstNameRequired') }}
            </p>
          </div>
          <div class="dd__field">
            <label class="dd__label" for="dd-last">
              {{ t('app.drivers.dialog.lastNameLabel') }}
              <span class="dd__req" aria-hidden="true">*</span>
            </label>
            <input
              id="dd-last"
              v-model="form.lastName"
              type="text"
              class="dd__input"
              :class="{ 'dd__input--error': lastNameError }"
              :placeholder="t('app.drivers.dialog.lastNamePlaceholder')"
              :aria-invalid="lastNameError"
              autocomplete="off"
              maxlength="60"
              :disabled="saving"
              @input="lastNameError = false"
            >
            <p v-if="lastNameError" class="dd__hint dd__hint--error">
              {{ t('app.drivers.dialog.lastNameRequired') }}
            </p>
          </div>
        </div>

        <div class="dd__field">
          <label class="dd__label" for="dd-phone">{{ t('app.drivers.dialog.phoneLabel') }}</label>
          <input
            id="dd-phone"
            v-model="form.phoneNumber"
            type="tel"
            class="dd__input dd__input--mono"
            :placeholder="t('app.drivers.dialog.phonePlaceholder')"
            autocomplete="off"
            inputmode="tel"
            maxlength="32"
            :disabled="saving"
          >
        </div>

        <div class="dd__field">
          <label class="dd__label" for="dd-email">{{ t('app.drivers.dialog.emailLabel') }}</label>
          <input
            id="dd-email"
            v-model="form.email"
            type="email"
            class="dd__input"
            :class="{ 'dd__input--error': emailError }"
            :placeholder="t('app.drivers.dialog.emailPlaceholder')"
            :aria-invalid="emailError"
            autocomplete="off"
            inputmode="email"
            maxlength="120"
            :disabled="saving"
            @input="emailError = false"
          >
          <p v-if="emailError" class="dd__hint dd__hint--error">
            {{ t('app.drivers.dialog.emailInvalid') }}
          </p>
        </div>

        <p class="dd__note">{{ t('app.drivers.dialog.optionalNote') }}</p>

        <footer class="dd__foot">
          <span v-if="addedThisSession > 0" class="dd__tally">
            {{ t('app.drivers.dialog.tally', { n: addedThisSession }) }}
          </span>
          <div class="dd__actions">
            <button
              type="button"
              class="dd__btn dd__btn--ghost"
              :disabled="saving"
              @click="onSaveAndAddAnother"
            >
              {{ t('app.drivers.dialog.addAnother') }}
            </button>
            <button
              type="submit"
              class="dd__btn dd__btn--primary"
              :disabled="saving"
            >
              <span v-if="!saving">{{ t('app.drivers.dialog.submit') }}</span>
              <span v-else class="dd__spinner" aria-hidden="true" />
              <span v-if="saving" class="dd__sr">{{ t('app.drivers.dialog.submitting') }}</span>
            </button>
          </div>
        </footer>
      </form>
    </div>
  </dialog>
</template>

<style scoped>
.dd__sr {
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
.dd {
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

.dd::backdrop {
  background: oklch(0.155 0.018 268 / 0.42);
  backdrop-filter: blur(2px);
}

.dd[open] {
  animation: dd-pop var(--duration-ui) var(--ease-out);
}

.dd[open]::backdrop {
  animation: dd-fade var(--duration-ui) var(--ease-out);
}

.dd__panel {
  display: flex;
  flex-direction: column;
  max-height: inherit;
}

/* ── Header ───────────────────────────────────────────────── */
.dd__head {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-6) var(--space-4);
}

.dd__head-icon {
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

.dd__head-copy {
  flex: 1;
  min-width: 0;
}

.dd__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--color-ink);
}

.dd__subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-muted);
}

.dd__close {
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

.dd__close:hover {
  background: var(--color-surface-mid);
  color: var(--color-ink);
}

.dd__close:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* ── Form ─────────────────────────────────────────────────── */
.dd__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: 0 var(--space-6) var(--space-6);
  overflow-y: auto;
}

.dd__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.dd__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}

.dd__label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-ink);
  line-height: 1;
}

.dd__req {
  color: var(--color-primary);
}

.dd__input {
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

.dd__input--mono {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.dd__input::placeholder {
  color: var(--color-muted);
  opacity: 0.55;
}

.dd__input:hover:not(:disabled) {
  border-color: oklch(0.68 0.012 268);
}

.dd__input:focus {
  border-color: var(--color-primary);
  background: var(--color-bg);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

.dd__input--error,
.dd__input--error:hover {
  border-color: var(--color-risk);
}

.dd__input--error:focus {
  box-shadow: 0 0 0 3px var(--color-risk-bg);
}

.dd__input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dd__hint {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.3;
}

.dd__hint--error {
  color: var(--color-risk);
}

.dd__note {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--color-muted);
}

/* ── Banners ──────────────────────────────────────────────── */
.dd__banner {
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

.dd__banner :deep(svg) {
  flex-shrink: 0;
}

.dd__banner--error {
  background: var(--color-risk-bg);
  color: var(--color-risk);
}

.dd__banner--ok {
  background: var(--color-comply-bg);
  color: var(--color-comply);
}

/* ── Footer ───────────────────────────────────────────────── */
.dd__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-2);
  flex-wrap: wrap;
}

.dd__tally {
  font-size: 0.8125rem;
  color: var(--color-muted);
}

.dd__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}

.dd__btn {
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

.dd__btn--ghost {
  background: var(--color-surface-mid);
  color: var(--color-ink);
}

.dd__btn--ghost:hover:not(:disabled) {
  background: var(--color-surface-high);
}

.dd__btn--primary {
  min-width: 7.5rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.dd__btn--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
  box-shadow: 0 4px 16px var(--color-primary-subtle);
}

.dd__btn:active:not(:disabled) {
  transform: scale(0.98);
}

.dd__btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.dd__btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.dd__spinner {
  width: 1.05rem;
  height: 1.05rem;
  border: 2px solid oklch(1 0 0 / 0.35);
  border-top-color: var(--color-on-primary);
  border-radius: 50%;
  animation: dd-spin 0.7s linear infinite;
}

/* ── Transitions ──────────────────────────────────────────── */
.dd-slide-enter-active,
.dd-slide-leave-active {
  transition: opacity var(--duration-ui) var(--ease-out),
    transform var(--duration-ui) var(--ease-out);
}

.dd-slide-enter-from,
.dd-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes dd-pop {
  from { opacity: 0; transform: translateY(10px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes dd-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes dd-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 540px) {
  .dd__row {
    grid-template-columns: 1fr;
  }

  .dd__head,
  .dd__form {
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }

  .dd__actions {
    width: 100%;
  }

  .dd__btn {
    flex: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dd[open],
  .dd[open]::backdrop {
    animation: none;
  }

  .dd-slide-enter-active,
  .dd-slide-leave-active {
    transition: opacity var(--duration-fast) var(--ease-out);
  }

  .dd-slide-enter-from,
  .dd-slide-leave-to {
    transform: none;
  }

  .dd__spinner {
    animation-duration: 1.4s;
  }
}
</style>
