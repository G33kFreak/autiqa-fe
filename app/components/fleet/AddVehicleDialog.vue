<script setup lang="ts">
import type { CreateCarDto } from '#shared/dto/create-car.dto';
import type { DriverDto } from '#shared/dto/driver.dto';
import EntityDialogShell from '~/components/shared/EntityDialogShell.vue';
import SearchableSelect from '~/components/shared/SearchableSelect.vue';
import { CarsBatchCreateError } from '~/utils/cars-batch-error';

const { t } = useI18n();
const carsStore = useCarsStore();
const driversStore = useDriversStore();

const dialogShell = ref<InstanceType<typeof EntityDialogShell> | null>(null);
const formError = ref<string | null>(null);
/** 0-based indices from the API when a batch create fails (validation or DB). */
const failedRowIndices = ref<Set<number>>(new Set());

type CarFormRow = {
  id: string;
  model: string;
  vin: string;
  plateNumber: string;
  /** UUID string expected by backend `assignedDriverId`. */
  driverId: string;
  /** yyyy-mm-dd expected by backend `inspectionValidUntil`. */
  inspectionValidUntil: string;
};

function newRow(): CarFormRow {
  return {
    id: crypto.randomUUID(),
    model: '',
    vin: '',
    plateNumber: '',
    driverId: '',
    inspectionValidUntil: '',
  };
}

const rows = ref<CarFormRow[]>([newRow()]);
const driverByIdCache = ref<Record<string, DriverDto>>({});
const driverSuggestions = ref<DriverDto[]>([]);
const driverSearching = ref(false);
let driverSearchTimer: ReturnType<typeof setTimeout> | null = null;

function driverLabel(driver: DriverDto): string {
  return `${driver.firstName} ${driver.lastName}`.trim();
}

function selectedDriverForRow(row: CarFormRow): DriverDto | null {
  if (!row.driverId) return null;
  return driverByIdCache.value[row.driverId]
    ?? driverSuggestions.value.find((driver) => driver.id === row.driverId)
    ?? null;
}

function resetForm() {
  formError.value = null;
  failedRowIndices.value = new Set();
  rows.value = [newRow()];
  driverByIdCache.value = {};
  driverSuggestions.value = [];
  driverSearching.value = false;
  if (driverSearchTimer) {
    clearTimeout(driverSearchTimer);
    driverSearchTimer = null;
  }
}

function onDialogClose() {
  formError.value = null;
  failedRowIndices.value = new Set();
  driverSuggestions.value = [];
  driverSearching.value = false;
  if (driverSearchTimer) {
    clearTimeout(driverSearchTimer);
    driverSearchTimer = null;
  }
}

function showModal() {
  resetForm();
  dialogShell.value?.showModal();
}

function close() {
  dialogShell.value?.close();
}

function addAnother() {
  const row = newRow();
  rows.value.push(row);
  nextTick(() => {
    const el = document.getElementById(`add-vehicle-card-${row.id}`);
    el?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
    document
      .getElementById(`add-vehicle-model-${row.id}`)
      ?.focus({ preventScroll: true });
  });
}

function removeRow(id: string) {
  if (rows.value.length <= 1) return;
  rows.value = rows.value.filter((r) => r.id !== id);
}

function setUppercaseField(
  row: CarFormRow,
  key: 'plateNumber' | 'vin',
  event: Event,
) {
  const el = event.target as HTMLInputElement;
  row[key] = el.value.toUpperCase();
}

async function loadDriverSuggestions(limit = 20) {
  driverSearching.value = true;
  try {
    const items = await driversStore.getDriverSuggestions(limit);
    driverSuggestions.value = items;
    for (const driver of items) {
      driverByIdCache.value[driver.id] = driver;
    }
  } finally {
    driverSearching.value = false;
  }
}

function pickDriver(row: CarFormRow, driver: DriverDto) {
  row.driverId = driver.id;
  driverByIdCache.value[driver.id] = driver;
}

function clearDriver(row: CarFormRow) {
  row.driverId = '';
}

function onDriverSearchInput(queryRaw: string) {
  const query = queryRaw.trim();
  if (driverSearchTimer) clearTimeout(driverSearchTimer);

  driverSearchTimer = setTimeout(async () => {
    driverSearching.value = true;
    try {
      const items = query.length
        ? await driversStore.searchDrivers(query, 20)
        : await driversStore.getDriverSuggestions(20);
      driverSuggestions.value = items;
      for (const driver of items) {
        driverByIdCache.value[driver.id] = driver;
      }
    } finally {
      driverSearching.value = false;
    }
  }, 350);
}

const driverOptions = computed(() =>
  driverSuggestions.value.map((driver) => ({
    id: driver.id,
    label: driverLabel(driver),
    meta: driver.email || driver.phoneNumber || '—',
  })),
);

function rowPayload(row: CarFormRow): CreateCarDto | null {
  const model = row.model.trim();
  if (!model.length) return null;
  const payload: CreateCarDto = { model };
  const vin = row.vin.trim();
  const plate = row.plateNumber.trim();
  const driverId = row.driverId.trim();
  const inspectionValidUntil = row.inspectionValidUntil.trim();

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (vin.length) payload.vin = vin;
  if (plate.length) payload.plateNumber = plate;
  if (driverId.length && uuidRegex.test(driverId)) {
    payload.assignedDriverId = driverId;
  }
  if (inspectionValidUntil.length && isoDateRegex.test(inspectionValidUntil)) {
    payload.inspectionValidUntil = inspectionValidUntil;
  }
  return payload;
}

async function onSubmit() {
  formError.value = null;
  failedRowIndices.value = new Set();
  const payloads = rows.value.map(rowPayload);
  if (payloads.some((p) => p === null)) {
    formError.value = t('appSections.fleet.addVehicleValidationModelsRequired');
    return;
  }

  try {
    await carsStore.createCars(payloads as CreateCarDto[]);
    close();
  } catch (e) {
    if (e instanceof CarsBatchCreateError) {
      failedRowIndices.value = new Set(e.failedIndices);
      formError.value =
        e.message.trim() || t('appSections.fleet.addVehicleError');
    } else {
      formError.value = t('appSections.fleet.addVehicleError');
    }
  }
}

defineExpose({ showModal, close });
</script>

<template>
  <EntityDialogShell
    ref="dialogShell"
    title-id="add-vehicle-dialog-title"
    :title="t('appSections.fleet.addVehicleTitle')"
    @close="onDialogClose"
  >
    <template #body>
      <form id="add-vehicle-form" class="add-vehicle-dialog__form" @submit.prevent="onSubmit">
        <div class="add-vehicle-dialog__list">
            <section
              v-for="(row, index) in rows"
              :id="`add-vehicle-card-${row.id}`"
              :key="row.id"
              class="add-vehicle-dialog__card add-vehicle-dialog__card--active"
              :class="{
                'add-vehicle-dialog__card--error': failedRowIndices.has(index),
              }"
            >
              <div class="add-vehicle-dialog__card-head">
                <div class="add-vehicle-dialog__card-title-wrap">
                  <span class="material-symbols-outlined" aria-hidden="true">directions_car</span>
                  <h3 class="add-vehicle-dialog__card-title">
                    {{ t('appSections.fleet.addVehicleIndex', { n: index + 1 }) }}
                  </h3>
                </div>
                <button
                  v-if="rows.length > 1"
                  type="button"
                  class="add-vehicle-dialog__remove"
                  :aria-label="t('appSections.fleet.addVehicleRemoveRow')"
                  @click="removeRow(row.id)"
                >
                  <span class="material-symbols-outlined" aria-hidden="true"
                    >close</span
                  >
                </button>
              </div>

              <div class="add-vehicle-dialog__row add-vehicle-dialog__row--model-plate">
                <div class="add-vehicle-dialog__field">
                  <label
                    class="add-vehicle-dialog__label"
                    :for="`add-vehicle-model-${row.id}`"
                  >{{ `${t('appSections.fleet.addVehicleModel')} *` }}</label>
                  <input
                    :id="`add-vehicle-model-${row.id}`"
                    v-model="row.model"
                    type="text"
                    name="model"
                    autocomplete="off"
                    class="ti-input"
                    :placeholder="t('appSections.fleet.addVehicleModelPlaceholder')"
                    required
                  >
                </div>
                <div class="add-vehicle-dialog__field">
                  <label
                    class="add-vehicle-dialog__label"
                    :for="`add-vehicle-plate-${row.id}`"
                  >{{ t('appSections.fleet.addVehiclePlate') }}</label>
                  <input
                    :id="`add-vehicle-plate-${row.id}`"
                    :value="row.plateNumber"
                    type="text"
                    name="plateNumber"
                    autocomplete="off"
                    autocapitalize="characters"
                    class="ti-input add-vehicle-dialog__input-uppercase"
                    :placeholder="t('appSections.fleet.addVehiclePlatePlaceholder')"
                    @input="setUppercaseField(row, 'plateNumber', $event)"
                  >
                </div>
              </div>

              <div class="add-vehicle-dialog__field">
                <label
                  class="add-vehicle-dialog__label"
                  :for="`add-vehicle-vin-${row.id}`"
                >{{ t('appSections.fleet.addVehicleVin') }}</label>
                <input
                  :id="`add-vehicle-vin-${row.id}`"
                  :value="row.vin"
                  type="text"
                  name="vin"
                  autocomplete="off"
                  autocapitalize="characters"
                  class="ti-input add-vehicle-dialog__input-uppercase"
                  :placeholder="t('appSections.fleet.addVehicleVinPlaceholder')"
                  @input="setUppercaseField(row, 'vin', $event)"
                >
              </div>

              <div class="add-vehicle-dialog__row add-vehicle-dialog__row--driver-inspection">
                <div class="add-vehicle-dialog__field">
                  <label
                    class="add-vehicle-dialog__label"
                    :for="`add-vehicle-driver-${row.id}`"
                  >{{ t('appSections.fleet.addVehicleDriver') }}</label>
                  <SearchableSelect
                    :model-value="row.driverId"
                    :input-id="`add-vehicle-driver-${row.id}`"
                    :aria-label="t('appSections.fleet.addVehicleDriver')"
                    :placeholder="t('appSections.fleet.addVehicleDriverUnassigned')"
                    :selected-label="selectedDriverForRow(row) ? driverLabel(selectedDriverForRow(row)!) : ''"
                    :search-placeholder="t('appSections.drivers.searchPlaceholder')"
                    :options="driverOptions"
                    :loading="driverSearching"
                    :empty-option-label="t('appSections.fleet.addVehicleDriverUnassigned')"
                    @open="loadDriverSuggestions()"
                    @search="onDriverSearchInput"
                    @update:model-value="
                      (value) => {
                        if (!value) {
                          clearDriver(row);
                          return;
                        }
                        const picked = driverSuggestions.find((driver) => driver.id === value);
                        if (picked) pickDriver(row, picked);
                      }
                    "
                  />
                </div>
                <div class="add-vehicle-dialog__field">
                  <label
                    class="add-vehicle-dialog__label"
                    :for="`add-vehicle-inspection-${row.id}`"
                  >{{ t('appSections.fleet.addVehicleInspectionExpiry') }}</label>
                  <FleetDateInput
                    v-model="row.inspectionValidUntil"
                    :input-id="`add-vehicle-inspection-${row.id}`"
                    :title="t('appSections.fleet.addVehicleInspectionExpiry')"
                  />
                </div>
              </div>
            </section>

            <button
              type="button"
              class="add-vehicle-dialog__add-another"
              @click="addAnother"
            >
              <span class="material-symbols-outlined" aria-hidden="true">add_circle</span>
              {{ t('appSections.fleet.addVehicleAddAnother') }}
            </button>
        </div>
      </form>
    </template>
    <template #footer>
      <div class="add-vehicle-dialog__footer">
        <p v-if="formError" class="add-vehicle-dialog__error" role="alert">
          {{ formError }}
        </p>
        <button
          type="button"
          class="add-vehicle-dialog__btn add-vehicle-dialog__btn--ghost"
          @click="close"
        >
          {{ t('appSections.fleet.addVehicleCancel') }}
        </button>
        <button
          form="add-vehicle-form"
          type="submit"
          class="add-vehicle-dialog__btn add-vehicle-dialog__btn--primary"
          :disabled="carsStore.creating"
        >
          {{
            rows.length > 1
              ? t('appSections.fleet.addVehicleSubmitAll')
              : t('appSections.fleet.addVehicleSubmit')
          }}
        </button>
      </div>
    </template>
  </EntityDialogShell>
</template>

<style scoped>
.add-vehicle-dialog__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.add-vehicle-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.55rem;
}

.add-vehicle-dialog__list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.add-vehicle-dialog__card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.2rem;
  border-radius: 0.75rem;
  background: var(--color-surface-container-lowest);
  box-shadow: var(--shadow-ambient);
  position: relative;
}

.add-vehicle-dialog__card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 0.75rem 0 0 0.75rem;
  background: var(--color-secondary);
}

.add-vehicle-dialog__card--error {
  background: color-mix(in srgb, var(--color-error) 8%, var(--color-surface-container-lowest));
}

.add-vehicle-dialog__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}

.add-vehicle-dialog__card-title-wrap {
  min-width: 0;
  flex: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-secondary);
}

.add-vehicle-dialog__card-title {
  margin: 0;
  color: var(--color-on-surface);
  font-size: 1rem;
  font-weight: 700;
}

.add-vehicle-dialog__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  border-radius: 0.75rem;
  color: var(--color-on-surface-variant);
  background: transparent;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.add-vehicle-dialog__remove:hover {
  color: var(--color-on-surface);
  background: color-mix(in srgb, var(--color-error) 12%, transparent);
}

.add-vehicle-dialog__remove .material-symbols-outlined { font-size: 1rem; }

.add-vehicle-dialog__remove:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  outline-offset: 2px;
}

.add-vehicle-dialog__field {
  min-width: 0;
}

.add-vehicle-dialog__row--model-plate {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(6.75rem, 9.25rem);
  gap: 1rem;
  align-items: stretch;
}

.add-vehicle-dialog__row--driver-inspection {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1rem;
  align-items: stretch;
}

/* Equal column height: long labels wrap; controls share one baseline row */
.add-vehicle-dialog__row .add-vehicle-dialog__field {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.add-vehicle-dialog__row .add-vehicle-dialog__label {
  flex-shrink: 0;
  align-self: stretch;
}

.add-vehicle-dialog__row .add-vehicle-dialog__field > .ti-input,
.add-vehicle-dialog__row .add-vehicle-dialog__field > select {
  margin-top: auto;
  width: 100%;
}

@media (max-width: 28rem) {
  .add-vehicle-dialog__row--model-plate,
  .add-vehicle-dialog__row--driver-inspection {
    grid-template-columns: 1fr;
    gap: 0.75rem 0;
  }
}

.add-vehicle-dialog__input-uppercase {
  text-transform: uppercase;
}

.add-vehicle-dialog__label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.add-vehicle-dialog__add-another {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.8rem;
  border: 2px dashed color-mix(in srgb, var(--color-outline-variant) 50%, transparent);
  border-radius: 0.75rem;
  background: transparent;
  color: var(--color-on-surface-variant);
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.18s ease, border-color 0.18s ease, background-color 0.18s ease;
}

.add-vehicle-dialog__add-another:hover {
  color: var(--color-secondary);
  border-color: color-mix(in srgb, var(--color-secondary) 50%, transparent);
  background: color-mix(in srgb, var(--color-secondary) 6%, transparent);
}

.add-vehicle-dialog__error {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-error);
  margin-right: auto;
  align-self: center;
}

.add-vehicle-dialog__btn {
  padding: 0.65rem 0.95rem;
  border: none;
  border-radius: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    opacity 0.18s ease,
    background-color 0.18s ease,
    transform 0.18s ease;
}

.add-vehicle-dialog__btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.add-vehicle-dialog__btn--ghost {
  color: var(--color-on-surface);
  background: transparent;
}

.add-vehicle-dialog__btn--ghost:hover:not(:disabled) {
  background: var(--color-surface-container-high);
}

.add-vehicle-dialog__btn--primary {
  color: var(--color-on-secondary);
  background: linear-gradient(
    135deg,
    var(--color-secondary) 0%,
    var(--color-secondary-container) 100%
  );
}

.add-vehicle-dialog__btn--primary:hover:not(:disabled) {
  opacity: 0.94;
  transform: translateY(-1px);
}
</style>
