<script setup lang="ts">
import type { CreateCarDto } from '#shared/dto/create-car.dto';
import type { DriverDto } from '#shared/dto/driver.dto';
import EntityDialogShell from '~/components/shared/EntityDialogShell.vue';
import SearchableSelect from '~/components/shared/SearchableSelect.vue';
import { CarsBatchCreateError } from '~/utils/cars-batch-error';

const props = withDefaults(
  defineProps<{
    /** After a successful save, go to the last created vehicle detail (e.g. from dashboard). */
    navigateToCreatedDetail?: boolean;
  }>(),
  { navigateToCreatedDetail: false },
);

const { t } = useI18n();
const localePath = useLocalePath();
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
    const created = await carsStore.createCars(payloads as CreateCarDto[]);
    close();
    if (props.navigateToCreatedDetail && created.length > 0) {
      const id = created[created.length - 1]!.id;
      await navigateTo(localePath(`/app/fleet/${id}`));
    }
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
      <form id="add-vehicle-form" class="app-dialog-form" @submit.prevent="onSubmit">
        <div class="app-dialog-stack">
          <AppDialogFormCard
            v-for="(row, index) in rows"
            :id="`add-vehicle-card-${row.id}`"
            :key="row.id"
            icon="directions_car"
            :title="t('appSections.fleet.addVehicleIndex', { n: index + 1 })"
            :has-error="failedRowIndices.has(index)"
            :show-remove="rows.length > 1"
            :remove-label="t('appSections.fleet.addVehicleRemoveRow')"
            @remove="removeRow(row.id)"
          >
              <div class="app-dialog-grid app-dialog-grid--2-uneven">
                <div class="app-dialog-field">
                  <label
                    class="app-dialog-field__label"
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
                <div class="app-dialog-field">
                  <label
                    class="app-dialog-field__label"
                    :for="`add-vehicle-plate-${row.id}`"
                  >{{ t('appSections.fleet.addVehiclePlate') }}</label>
                  <input
                    :id="`add-vehicle-plate-${row.id}`"
                    :value="row.plateNumber"
                    type="text"
                    name="plateNumber"
                    autocomplete="off"
                    autocapitalize="characters"
                    class="ti-input app-dialog-input--uppercase"
                    :placeholder="t('appSections.fleet.addVehiclePlatePlaceholder')"
                    @input="setUppercaseField(row, 'plateNumber', $event)"
                  >
                </div>
              </div>

              <div class="app-dialog-field">
                <label
                  class="app-dialog-field__label"
                  :for="`add-vehicle-vin-${row.id}`"
                >{{ t('appSections.fleet.addVehicleVin') }}</label>
                <input
                  :id="`add-vehicle-vin-${row.id}`"
                  :value="row.vin"
                  type="text"
                  name="vin"
                  autocomplete="off"
                  autocapitalize="characters"
                  class="ti-input app-dialog-input--uppercase"
                  :placeholder="t('appSections.fleet.addVehicleVinPlaceholder')"
                  @input="setUppercaseField(row, 'vin', $event)"
                >
              </div>

              <div class="app-dialog-grid app-dialog-grid--2 app-dialog-grid--align-end">
                <div class="app-dialog-field">
                  <label
                    class="app-dialog-field__label"
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
                <div class="app-dialog-field">
                  <label
                    class="app-dialog-field__label"
                    :for="`add-vehicle-inspection-${row.id}`"
                  >{{ t('appSections.fleet.addVehicleInspectionExpiry') }}</label>
                  <FleetDateInput
                    v-model="row.inspectionValidUntil"
                    :input-id="`add-vehicle-inspection-${row.id}`"
                    :title="t('appSections.fleet.addVehicleInspectionExpiry')"
                  />
                </div>
              </div>
          </AppDialogFormCard>

          <button type="button" class="app-dialog-add-another" @click="addAnother">
            <span class="material-symbols-outlined" aria-hidden="true">add_circle</span>
            {{ t('appSections.fleet.addVehicleAddAnother') }}
          </button>
        </div>
      </form>
    </template>
    <template #footer>
      <AppDialogFooter
        :error="formError"
        :cancel-label="t('appSections.fleet.addVehicleCancel')"
        :submit-label="
          rows.length > 1
            ? t('appSections.fleet.addVehicleSubmitAll')
            : t('appSections.fleet.addVehicleSubmit')
        "
        :submit-disabled="carsStore.creating"
        form-id="add-vehicle-form"
        @cancel="close"
      />
    </template>
  </EntityDialogShell>
</template>

