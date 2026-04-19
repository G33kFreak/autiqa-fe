<script setup lang="ts">
import type { CreateCarDto } from '#shared/dto/create-car.dto';

const { t } = useI18n();
const carsStore = useCarsStore();

const addDialog = ref<HTMLDialogElement | null>(null);
const formError = ref<string | null>(null);

const form = reactive({
  model: '',
  vin: '',
  plateNumber: '',
});

const showEmpty = computed(
  () =>
    carsStore.listResolved &&
    !carsStore.loading &&
    carsStore.items.length === 0,
);

const showInitialLoading = computed(
  () =>
    !carsStore.listResolved ||
    (carsStore.loading && carsStore.items.length === 0),
);

const showFleetSummary = computed(
  () => carsStore.listResolved && carsStore.items.length > 0,
);

useSeoMeta({
  title: computed(() => t('appSections.fleet.title')),
  description: computed(() => t('appSections.fleet.lead')),
});

onMounted(async () => {
  await carsStore.getViewModel();
});

function openAddVehicle() {
  formError.value = null;
  form.model = '';
  form.vin = '';
  form.plateNumber = '';
  addDialog.value?.showModal();
}

function closeAddVehicle() {
  addDialog.value?.close();
}

async function submitAddVehicle() {
  formError.value = null;
  const model = form.model.trim();
  const payload: CreateCarDto = { model };
  const vin = form.vin.trim();
  const plate = form.plateNumber.trim();
  if (vin.length) payload.vin = vin;
  if (plate.length) payload.plateNumber = plate;

  try {
    await carsStore.createCar(payload);
    closeAddVehicle();
  } catch {
    formError.value = t('appSections.fleet.addVehicleError');
  }
}
</script>

<template>
  <div class="fleet-page">
    <template v-if="!showEmpty">
      <h1 class="app-page__title">{{ t('appSections.fleet.title') }}</h1>
      <p class="app-page__lead">{{ t('appSections.fleet.lead') }}</p>
    </template>

    <div
      v-if="showInitialLoading"
      class="fleet-page__loading"
      role="status"
      aria-live="polite"
    >
      <span
        class="material-symbols-outlined fleet-page__spinner"
        aria-hidden="true"
      >progress_activity</span>
      <p class="fleet-page__loading-text">{{ t('appSections.fleet.loading') }}</p>
    </div>

    <div
      v-else-if="showEmpty"
      class="fleet-page__empty-shell"
    >
      <div class="fleet-page__hero">
        <div class="fleet-page__hero-visual">
          <div
            class="fleet-page__hero-glow"
            aria-hidden="true"
          />
          <div class="fleet-page__hero-icon-ring">
            <span
              class="material-symbols-outlined fleet-page__hero-car"
              aria-hidden="true"
            >directions_car</span>
            <div
              class="fleet-page__hero-badge"
              aria-hidden="true"
            >
              <span class="material-symbols-outlined fleet-page__hero-badge-icon">add</span>
            </div>
          </div>
        </div>

        <h1 class="fleet-page__hero-title">
          {{ t('appSections.fleet.emptyTitle') }}
        </h1>
        <p class="fleet-page__hero-lead">
          {{ t('appSections.fleet.emptyBody') }}
        </p>

        <div class="fleet-page__hero-actions">
          <button
            type="button"
            class="fleet-page__cta fleet-page__cta--primary"
            @click="openAddVehicle"
          >
            <span
              class="material-symbols-outlined fleet-page__cta-icon"
              aria-hidden="true"
            >add_circle</span>
            {{ t('appSections.fleet.emptyCta') }}
          </button>
          <button
            type="button"
            class="fleet-page__cta fleet-page__cta--secondary"
            disabled
            :title="t('appSections.fleet.importSpreadsheetSoon')"
            :aria-label="`${t('appSections.fleet.importSpreadsheetCta')} (${t('appSections.fleet.importSpreadsheetSoon')})`"
          >
            <span
              class="material-symbols-outlined fleet-page__cta-icon"
              aria-hidden="true"
            >upload_file</span>
            {{ t('appSections.fleet.importSpreadsheetCta') }}
          </button>
        </div>
      </div>
    </div>

    <p
      v-else-if="showFleetSummary"
      class="fleet-page__summary"
    >
      {{ t('appSections.fleet.fleetCount', { count: carsStore.items.length }) }}
    </p>

    <dialog
      ref="addDialog"
      class="fleet-dialog"
      aria-labelledby="fleet-add-title"
      @close="formError = null"
    >
      <form
        class="fleet-dialog__form"
        @submit.prevent="submitAddVehicle"
      >
        <h2 id="fleet-add-title" class="fleet-dialog__title">
          {{ t('appSections.fleet.addVehicleTitle') }}
        </h2>

        <div class="fleet-dialog__field">
          <label class="fleet-dialog__label" for="fleet-model">{{
            t('appSections.fleet.addVehicleModel')
          }}</label>
          <input
            id="fleet-model"
            v-model="form.model"
            type="text"
            name="model"
            autocomplete="off"
            class="ti-input"
            :placeholder="t('appSections.fleet.addVehicleModelPlaceholder')"
            required
          >
        </div>

        <div class="fleet-dialog__field">
          <label class="fleet-dialog__label" for="fleet-vin">{{
            t('appSections.fleet.addVehicleVin')
          }}</label>
          <input
            id="fleet-vin"
            v-model="form.vin"
            type="text"
            name="vin"
            autocomplete="off"
            class="ti-input"
            :placeholder="t('appSections.fleet.addVehicleVinPlaceholder')"
          >
        </div>

        <div class="fleet-dialog__field">
          <label class="fleet-dialog__label" for="fleet-plate">{{
            t('appSections.fleet.addVehiclePlate')
          }}</label>
          <input
            id="fleet-plate"
            v-model="form.plateNumber"
            type="text"
            name="plateNumber"
            autocomplete="off"
            class="ti-input"
            :placeholder="t('appSections.fleet.addVehiclePlatePlaceholder')"
          >
        </div>

        <p
          v-if="formError"
          class="fleet-dialog__error"
          role="alert"
        >
          {{ formError }}
        </p>

        <div class="fleet-dialog__actions">
          <button
            type="button"
            class="fleet-dialog__btn fleet-dialog__btn--ghost"
            @click="closeAddVehicle"
          >
            {{ t('appSections.fleet.addVehicleCancel') }}
          </button>
          <button
            type="submit"
            class="fleet-dialog__btn fleet-dialog__btn--primary"
            :disabled="carsStore.creating"
          >
            {{ t('appSections.fleet.addVehicleSubmit') }}
          </button>
        </div>
      </form>
    </dialog>
  </div>
</template>

<style scoped>
.fleet-page__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 14rem;
  padding: 2rem 1rem;
  border-radius: 0.75rem;
  background: var(--color-surface-container-low);
}

.fleet-page__spinner {
  font-size: 2rem;
  color: var(--color-secondary-container);
  animation: fleet-page-spin 0.85s linear infinite;
}

@keyframes fleet-page-spin {
  to {
    transform: rotate(360deg);
  }
}

.fleet-page__loading-text {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-on-surface-variant);
}

.fleet-page__empty-shell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: min(36rem, calc(100dvh - 12rem));
  padding: 2rem 1rem 3rem;
}

.fleet-page__hero {
  width: 100%;
  max-width: 36rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.fleet-page__hero-visual {
  position: relative;
  margin-bottom: 2rem;
}

.fleet-page__hero-glow {
  position: absolute;
  inset: -35%;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-secondary-container) 14%, transparent);
  filter: blur(36px);
  transform: scale(1.15);
  transition:
    transform 0.45s ease,
    background 0.45s ease;
  pointer-events: none;
}

.fleet-page__hero-visual:hover .fleet-page__hero-glow {
  transform: scale(1.25);
  background: color-mix(in srgb, var(--color-secondary-container) 18%, transparent);
}

.fleet-page__hero-icon-ring {
  position: relative;
  z-index: 1;
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-container-lowest);
  box-shadow:
    var(--shadow-ambient),
    0 0 0 1px color-mix(in srgb, var(--color-outline-variant) 15%, transparent);
}

.fleet-page__hero-car {
  font-size: 3.75rem;
  line-height: 1;
  color: color-mix(in srgb, var(--color-secondary) 88%, var(--color-secondary-container));
  opacity: 0.88;
  font-variation-settings:
    'FILL' 0,
    'wght' 200,
    'GRAD' 0,
    'opsz' 24;
}

.fleet-page__hero-badge {
  position: absolute;
  right: -0.125rem;
  bottom: -0.125rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    145deg,
    var(--color-secondary) 0%,
    var(--color-secondary-container) 100%
  );
  color: var(--color-on-secondary);
  box-shadow:
    0 6px 18px color-mix(in srgb, var(--color-secondary) 28%, transparent),
    0 0 0 4px var(--color-surface-container-lowest);
}

.fleet-page__hero-badge-icon {
  font-size: 1.25rem;
  font-variation-settings:
    'FILL' 1,
    'wght' 500,
    'GRAD' 0,
    'opsz' 24;
}

.fleet-page__hero-title {
  margin: 0 0 1rem;
  max-width: 26rem;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 1.875rem);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.15;
  color: var(--color-on-surface);
}

.fleet-page__hero-lead {
  margin: 0 0 2.25rem;
  max-width: 28rem;
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.6;
  color: var(--color-on-surface-variant);
}

.fleet-page__hero-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
  width: 100%;
  max-width: 22rem;
}

@media (min-width: 480px) {
  .fleet-page__hero-actions {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    max-width: none;
  }

  .fleet-page__cta {
    min-width: 12rem;
  }
}

.fleet-page__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    opacity 0.18s ease,
    transform 0.18s ease,
    background 0.18s ease;
}

.fleet-page__cta--primary {
  color: var(--color-on-secondary);
  background: linear-gradient(
    135deg,
    var(--color-secondary) 0%,
    var(--color-secondary-container) 100%
  );
  box-shadow:
    0 4px 16px color-mix(in srgb, var(--color-secondary-container) 28%, transparent),
    0 12px 32px color-mix(in srgb, var(--color-secondary) 12%, transparent);
}

.fleet-page__cta--primary:hover:not(:disabled) {
  opacity: 0.96;
  transform: translateY(-1px);
  box-shadow:
    0 6px 22px color-mix(in srgb, var(--color-secondary-container) 32%, transparent),
    0 14px 36px color-mix(in srgb, var(--color-secondary) 14%, transparent);
}

.fleet-page__cta--secondary {
  color: var(--color-on-surface);
  background: var(--color-surface-container-high);
}

.fleet-page__cta--secondary:hover:not(:disabled) {
  background: var(--color-surface-container-highest);
}

.fleet-page__cta--secondary:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.fleet-page__cta:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  outline-offset: 3px;
}

.fleet-page__cta-icon {
  font-size: 1.25rem;
}

.fleet-page__cta--primary .fleet-page__cta-icon {
  font-variation-settings:
    'FILL' 1,
    'wght' 500,
    'GRAD' 0,
    'opsz' 24;
}

.fleet-page__summary {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-on-surface-variant);
}

.fleet-dialog {
  border: none;
  border-radius: 0.75rem;
  padding: 0;
  max-width: 26rem;
  width: calc(100vw - 2rem);
  background: var(--color-surface-container-lowest);
  box-shadow: var(--shadow-ambient);
}

.fleet-dialog::backdrop {
  background: color-mix(in srgb, var(--color-inverse-surface) 38%, transparent);
  backdrop-filter: blur(12px);
}

.fleet-dialog__form {
  padding: 1.5rem 1.35rem 1.35rem;
}

.fleet-dialog__title {
  margin: 0 0 1.25rem;
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-on-surface);
}

.fleet-dialog__field {
  margin-bottom: 1rem;
}

.fleet-dialog__label {
  display: block;
  margin-bottom: 0.35rem;
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.fleet-dialog__error {
  margin: 0 0 1rem;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-error);
}

.fleet-dialog__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.65rem;
  margin-top: 0.25rem;
}

.fleet-dialog__btn {
  padding: 0.65rem 1.1rem;
  border: none;
  border-radius: 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.18s ease;
}

.fleet-dialog__btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.fleet-dialog__btn--ghost {
  color: var(--color-secondary-container);
  background: transparent;
}

.fleet-dialog__btn--ghost:hover:not(:disabled) {
  opacity: 0.85;
}

.fleet-dialog__btn--primary {
  color: var(--color-on-secondary);
  background: linear-gradient(
    135deg,
    var(--color-secondary) 0%,
    var(--color-secondary-container) 100%
  );
}

.fleet-dialog__btn--primary:hover:not(:disabled) {
  opacity: 0.94;
}
</style>
