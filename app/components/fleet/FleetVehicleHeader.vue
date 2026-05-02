<script setup lang="ts">
const props = defineProps<{
  overline: string;
  carName: string;
  plateLabel: string;
  registrationNumber: string;
  vinLabel: string;
  vin: string;
  editVehicleLabel: string;
  addExpenseLabel: string;
  addIncomeLabel: string;
  saveLabel: string;
  savingLabel: string;
  cancelLabel: string;
  isSaving?: boolean;
}>();

const emit = defineEmits<{
  updateInfo: [
    payload: {
      carName: string;
      registrationNumber: string;
      vin: string;
    },
  ];
  addExpense: [];
  addIncome: [];
}>();
const { t } = useI18n();

const isEditing = ref(false);
const saveTriggered = ref(false);
const draftCarName = ref(props.carName);
const draftRegistrationNumber = ref(props.registrationNumber);
const draftVin = ref(props.vin);
const displayCarName = computed(
  () => props.carName.trim() || t('appSections.fleet.vehicleDetails.unnamedVehicle'),
);
const displayPlate = computed(
  () => props.registrationNumber.trim() || t('appSections.fleet.vehicleDetails.emptyPlate'),
);
const displayVin = computed(
  () => props.vin.trim() || t('appSections.fleet.vehicleDetails.emptyVin'),
);
const canSave = computed(() => draftCarName.value.trim().length > 0);

watch(
  (): [string, string, string] => [
    props.carName,
    props.registrationNumber,
    props.vin,
  ],
  ([carName, registrationNumber, vin]) => {
    if (isEditing.value) return;
    draftCarName.value = carName;
    draftRegistrationNumber.value = registrationNumber;
    draftVin.value = vin;
  },
);

function startEditing() {
  isEditing.value = true;
  draftCarName.value = props.carName;
  draftRegistrationNumber.value = props.registrationNumber;
  draftVin.value = props.vin;
}

function cancelEditing() {
  if (props.isSaving) return;
  isEditing.value = false;
  draftCarName.value = props.carName;
  draftRegistrationNumber.value = props.registrationNumber;
  draftVin.value = props.vin;
}

function saveEditing() {
  if (props.isSaving) return;
  if (!canSave.value) return;
  saveTriggered.value = true;
  emit('updateInfo', {
    carName: draftCarName.value.trim() || props.carName,
    registrationNumber:
      draftRegistrationNumber.value.trim() || props.registrationNumber,
    vin: draftVin.value.trim() || props.vin,
  });
}

watch(
  () => props.isSaving,
  (isSaving) => {
    if (isSaving) return;
    if (!saveTriggered.value) return;
    isEditing.value = false;
    saveTriggered.value = false;
  },
);

function setUppercaseField(
  key: 'draftRegistrationNumber' | 'draftVin',
  event: Event,
) {
  const el = event.target as HTMLInputElement;
  const value = el.value.toUpperCase();
  if (key === 'draftRegistrationNumber') {
    draftRegistrationNumber.value = value;
    return;
  }
  draftVin.value = value;
}
</script>

<template>
  <header class="fleet-vehicle-page__header">
    <div class="fleet-vehicle-page__identity">
      <p class="fleet-vehicle-page__overline">{{ overline }}</p>
      <template v-if="isEditing">
        <div class="fleet-vehicle-page__edit-fields">
          <label class="fleet-vehicle-page__field">
            <input
              v-model="draftCarName"
              type="text"
              class="fleet-vehicle-page__input"
            >
          </label>
          <div class="fleet-vehicle-page__meta-grid">
            <label class="fleet-vehicle-page__field">
              <span class="fleet-vehicle-page__field-label">{{
                plateLabel
              }}</span>
              <input
                v-model="draftRegistrationNumber"
                type="text"
                autocapitalize="characters"
                class="fleet-vehicle-page__input fleet-vehicle-page__input-uppercase"
                @input="setUppercaseField('draftRegistrationNumber', $event)"
              >
            </label>
            <label class="fleet-vehicle-page__field">
              <span class="fleet-vehicle-page__field-label">{{
                vinLabel
              }}</span>
              <input
                v-model="draftVin"
                type="text"
                autocapitalize="characters"
                class="fleet-vehicle-page__input fleet-vehicle-page__input-uppercase"
                @input="setUppercaseField('draftVin', $event)"
              >
            </label>
          </div>
        </div>
      </template>
      <template v-else>
        <h1 class="fleet-vehicle-page__title">{{ displayCarName }}</h1>
        <p class="fleet-vehicle-page__meta">
          <span
            class="fleet-vehicle-page__plate-meta"
            :class="{
              'fleet-vehicle-page__plate-meta--empty': !registrationNumber.trim(),
            }"
          >
            <span
              class="material-symbols-outlined fleet-vehicle-page__plate-icon"
              aria-hidden="true"
            >pin</span>
            <span
              class="fleet-vehicle-page__chip"
              :class="{ 'fleet-vehicle-page__chip--empty': !registrationNumber.trim() }"
            >{{ displayPlate }}</span>
          </span>
          <span
            class="fleet-vehicle-page__id"
            :class="{ 'fleet-vehicle-page__id--empty': !vin.trim() }"
          >
            <span
              class="material-symbols-outlined fleet-vehicle-page__meta-icon"
              aria-hidden="true"
            >fingerprint</span>
            <span>{{ vinLabel }}: {{ displayVin }}</span>
          </span>
        </p>
      </template>
    </div>
    <div
      class="fleet-vehicle-page__actions"
      :class="{ 'fleet-vehicle-page__actions--editing': isEditing }"
    >
      <template v-if="!isEditing">
        <button
          type="button"
          class="fleet-vehicle-page__action fleet-vehicle-page__action--primary"
          @click="startEditing"
        >
          <span
            class="material-symbols-outlined fleet-vehicle-page__action-icon"
            aria-hidden="true"
          >edit</span>
          {{ editVehicleLabel }}
        </button>
        <button
          type="button"
          class="fleet-vehicle-page__action fleet-vehicle-page__action--secondary"
          @click="emit('addExpense')"
        >
          <span
            class="material-symbols-outlined fleet-vehicle-page__action-icon"
            aria-hidden="true"
          >receipt_long</span>
          {{ addExpenseLabel }}
        </button>
        <button
          type="button"
          class="fleet-vehicle-page__action fleet-vehicle-page__action--secondary"
          @click="emit('addIncome')"
        >
          <span
            class="material-symbols-outlined fleet-vehicle-page__action-icon"
            aria-hidden="true"
          >payments</span>
          {{ addIncomeLabel }}
        </button>
      </template>
      <template v-else>
        <button
          type="button"
          class="fleet-vehicle-page__action fleet-vehicle-page__action--primary"
          :disabled="props.isSaving || !canSave"
          @click="saveEditing"
        >
          {{ props.isSaving ? savingLabel : saveLabel }}
        </button>
        <button
          type="button"
          class="fleet-vehicle-page__action fleet-vehicle-page__action--secondary"
          :disabled="props.isSaving"
          @click="cancelEditing"
        >
          {{ cancelLabel }}
        </button>
      </template>
    </div>
  </header>
</template>

<style scoped>
.fleet-vehicle-page__header {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
  padding: 1.5rem 1.5rem;
  border-radius: 1rem;
  background: var(--color-surface-container-lowest);
  box-shadow: 0 12px 32px color-mix(in srgb, var(--color-on-surface) 2%, transparent);
}

.fleet-vehicle-page__identity {
  min-width: 0;
}

.fleet-vehicle-page__overline {
  margin: 0 0 0.35rem;
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.fleet-vehicle-page__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 2.5vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-on-surface);
  line-height: 1.1;
}

.fleet-vehicle-page__edit-fields {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.fleet-vehicle-page__meta {
  margin: 0.625rem 0 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.fleet-vehicle-page__meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.fleet-vehicle-page__plate-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.fleet-vehicle-page__plate-icon {
  font-size: 1rem;
  line-height: 1;
  color: var(--color-outline);
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'GRAD' 0,
    'opsz' 20;
}

.fleet-vehicle-page__plate-meta--empty .fleet-vehicle-page__plate-icon {
  color: var(--color-on-surface-variant);
}

.fleet-vehicle-page__chip {
  display: inline-flex;
  align-items: center;
  border-radius: 0.375rem;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--color-surface-container-high);
  color: var(--color-on-surface);
}

.fleet-vehicle-page__chip--empty {
  color: var(--color-on-surface-variant);
}

.fleet-vehicle-page__id {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-on-surface-variant);
}

.fleet-vehicle-page__id--empty {
  color: var(--color-on-surface-variant);
}

.fleet-vehicle-page__meta-icon {
  font-size: 1rem;
  line-height: 1;
  color: var(--color-outline);
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'GRAD' 0,
    'opsz' 20;
}

.fleet-vehicle-page__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.fleet-vehicle-page__field-label {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.fleet-vehicle-page__input {
  border: 0;
  border-radius: 0.5rem;
  padding: 0.45rem 0.6rem;
  font-size: 0.875rem;
  font-weight: 600;
  background: var(--color-surface-container-highest);
  color: var(--color-on-surface);
}

.fleet-vehicle-page__input-uppercase {
  text-transform: uppercase;
}

.fleet-vehicle-page__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  margin-top: 2rem;
  width: 100%;
}

.fleet-vehicle-page__actions--editing {
  margin-top: 1.25rem;
}

.fleet-vehicle-page__action {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 0;
  border-radius: 0.75rem;
  padding: 0.625rem 1.15rem;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    filter 0.18s ease;
}

.fleet-vehicle-page__action:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.fleet-vehicle-page__action--primary {
  background: var(--color-secondary);
  color: var(--color-on-secondary);
}

.fleet-vehicle-page__action--secondary {
  background: var(--color-surface-container-highest);
  color: var(--color-on-surface);
}

.fleet-vehicle-page__action--primary:hover:not(:disabled) {
  filter: brightness(1.06);
}

.fleet-vehicle-page__action--secondary:hover:not(:disabled) {
  background: var(--color-surface-variant);
}

.fleet-vehicle-page__action-icon {
  font-size: 1.125rem;
  line-height: 1;
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'GRAD' 0,
    'opsz' 24;
}

@media (max-width: 860px) {
  .fleet-vehicle-page__meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
