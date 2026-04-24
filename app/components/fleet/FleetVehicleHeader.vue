<script setup lang="ts">
const props = defineProps<{
  overline: string;
  carName: string;
  plateLabel: string;
  registrationNumber: string;
  vinLabel: string;
  vin: string;
  editInfoLabel: string;
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
    <div>
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
            class="fleet-vehicle-page__chip"
            :class="{ 'fleet-vehicle-page__chip--empty': !registrationNumber.trim() }"
          >
            {{ displayPlate }}
          </span>
          <span
            class="fleet-vehicle-page__id"
            :class="{ 'fleet-vehicle-page__id--empty': !vin.trim() }"
          >
            {{ vinLabel }}: {{ displayVin }}
          </span>
        </p>
      </template>
    </div>
    <div class="fleet-vehicle-page__actions">
      <button
        v-if="!isEditing"
        type="button"
        class="fleet-vehicle-page__action"
        @click="startEditing"
      >
        <span
          class="material-symbols-outlined fleet-vehicle-page__action-icon"
          aria-hidden="true"
        >
          edit
        </span>
        {{ editInfoLabel }}
      </button>
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
          class="fleet-vehicle-page__action"
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
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.125rem;
  border-radius: 1rem;
  background: var(--color-surface-container-low);
}

.fleet-vehicle-page__overline {
  margin: 0 0 0.35rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.fleet-vehicle-page__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2rem, 2.8vw, 2.7rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-on-surface);
  line-height: 1.05;
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
  gap: 0.5rem;
  flex-wrap: wrap;
}

.fleet-vehicle-page__meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.fleet-vehicle-page__chip {
  border-radius: 8px;
  padding: 0.3rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--color-surface-container-high);
  color: var(--color-on-surface);
}

.fleet-vehicle-page__chip--empty {
  color: var(--color-on-surface-variant);
}

.fleet-vehicle-page__id {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-on-surface-variant);
}

.fleet-vehicle-page__id--empty {
  color: var(--color-on-surface-variant);
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
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.fleet-vehicle-page__action {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 0;
  border-radius: 0.75rem;
  padding: 0.6rem 0.9rem;
  font-size: 0.8125rem;
  font-weight: 700;
  background: var(--color-surface-container-high);
  color: var(--color-on-surface);
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.fleet-vehicle-page__action:disabled {
  opacity: 0.75;
  cursor: not-allowed;
  transform: none;
}

.fleet-vehicle-page__action--primary {
  background: linear-gradient(
    135deg,
    var(--color-secondary) 0%,
    var(--color-secondary-container) 100%
  );
  color: var(--color-on-secondary);
  box-shadow:
    0 4px 16px
      color-mix(in srgb, var(--color-secondary-container) 28%, transparent),
    0 12px 32px color-mix(in srgb, var(--color-secondary) 12%, transparent);
}

@media (max-width: 860px) {
  .fleet-vehicle-page__header {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.75rem;
  }

  .fleet-vehicle-page__meta-grid {
    grid-template-columns: 1fr;
  }
}

.fleet-vehicle-page__action:hover:not(.fleet-vehicle-page__action--primary) {
  background: var(--color-surface-container);
  transform: translateY(-1px);
}

.fleet-vehicle-page__action--primary:hover {
  opacity: 0.96;
  transform: translateY(-1px);
  box-shadow:
    0 6px 22px
      color-mix(in srgb, var(--color-secondary-container) 32%, transparent),
    0 14px 36px color-mix(in srgb, var(--color-secondary) 14%, transparent);
}

.fleet-vehicle-page__action-icon {
  font-size: 1rem;
  line-height: 1;
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'GRAD' 0,
    'opsz' 20;
}
</style>
