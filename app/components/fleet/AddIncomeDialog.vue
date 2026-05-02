<script setup lang="ts">
import type { CarDto } from '#shared/dto/car.dto';
import type { CreateIncomeDto } from '#shared/dto/create-income.dto';
import type { DriverDto } from '#shared/dto/driver.dto';
import type { IncomeDto } from '#shared/dto/income.dto';
import EntityDialogShell from '~/components/shared/EntityDialogShell.vue';
import SearchableSelect from '~/components/shared/SearchableSelect.vue';

const props = withDefaults(defineProps<{
  initialCarId?: string;
  initialDriverId?: string;
}>(), {
  initialCarId: '',
  initialDriverId: '',
});

const emit = defineEmits<{
  created: [];
}>();

const { t } = useI18n();
const incomesStore = useIncomesStore();
const driversStore = useDriversStore();
const carsStore = useCarsStore();

const dialogShell = ref<InstanceType<typeof EntityDialogShell> | null>(null);
const editingIncomeId = ref<string | null>(null);
const editingCurrency = ref('PLN');
const formError = ref<string | null>(null);
const localCarId = ref('');
const localDriverId = ref('');
const selectedCar = ref<CarDto | null>(null);
const selectedDriver = ref<DriverDto | null>(null);
const carSuggestions = ref<CarDto[]>([]);
const driverSuggestions = ref<DriverDto[]>([]);
const carSearching = ref(false);
const driverSearching = ref(false);
let carSearchTimer: ReturnType<typeof setTimeout> | null = null;
let driverSearchTimer: ReturnType<typeof setTimeout> | null = null;

type IncomeFormModel = {
  amount: string;
  occurredAt: string;
  title: string;
  notes: string;
};

function getTodayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

const form = reactive<IncomeFormModel>({
  amount: '',
  occurredAt: getTodayDateInputValue(),
  title: '',
  notes: '',
});

const incomeDialogTitle = computed(() =>
  editingIncomeId.value
    ? t('appSections.fleet.vehicleDetails.incomeDialog.editTitle')
    : t('appSections.fleet.vehicleDetails.incomeDialog.title'),
);

const incomeDialogLead = computed(() =>
  editingIncomeId.value
    ? t('appSections.fleet.vehicleDetails.incomeDialog.editLead')
    : t('appSections.fleet.vehicleDetails.incomeDialog.lead'),
);

function showModal() {
  resetForm();
  dialogShell.value?.showModal();
  void loadInitialSuggestions();
}

async function showModalForEdit(income: IncomeDto) {
  editingIncomeId.value = income.id;
  editingCurrency.value = income.currency?.trim() || 'PLN';
  formError.value = null;
  form.amount = String(Number(income.amount) || 0);
  form.occurredAt = income.occurredAt.slice(0, 10);
  form.title = income.title ?? '';
  form.notes = income.notes ?? '';
  localCarId.value = income.carId;
  localDriverId.value = income.driverId;
  dialogShell.value?.showModal();
  carSearching.value = true;
  driverSearching.value = true;
  try {
    const [cars, drivers] = await Promise.all([
      carsStore.getCarSuggestions(30),
      driversStore.getDriverSuggestions(30),
    ]);
    carSuggestions.value = cars;
    driverSuggestions.value = drivers;
    selectedCar.value =
      cars.find((c) => c.id === income.carId) ??
      (await carsStore.fetchCarById(income.carId));
    let driver: DriverDto | null =
      drivers.find((d) => d.id === income.driverId) ?? null;
    if (!driver) {
      driver = await driversStore.fetchDriverById(income.driverId);
    }
    selectedDriver.value = driver;
  } finally {
    carSearching.value = false;
    driverSearching.value = false;
  }
}

function close() {
  dialogShell.value?.close();
}

function toIsoDateString(dateInput: string): string {
  return new Date(`${dateInput}T12:00:00.000Z`).toISOString();
}

function resetForm() {
  editingIncomeId.value = null;
  editingCurrency.value = 'PLN';
  formError.value = null;
  form.amount = '';
  form.occurredAt = getTodayDateInputValue();
  form.title = '';
  form.notes = '';
  selectedCar.value = null;
  selectedDriver.value = null;
  localCarId.value = props.initialCarId || '';
  localDriverId.value = props.initialDriverId || '';
}

function resetDialogState() {
  resetForm();
  formError.value = null;
  carSuggestions.value = [];
  driverSuggestions.value = [];
  carSearching.value = false;
  driverSearching.value = false;
  if (carSearchTimer) {
    clearTimeout(carSearchTimer);
    carSearchTimer = null;
  }
  if (driverSearchTimer) {
    clearTimeout(driverSearchTimer);
    driverSearchTimer = null;
  }
}

function carLabel(car: CarDto): string {
  return `${car.model} ${car.plateNumber ? `(${car.plateNumber})` : ''}`.trim();
}

function driverLabel(driver: DriverDto): string {
  return `${driver.firstName} ${driver.lastName}`.trim();
}

async function loadInitialSuggestions() {
  carSearching.value = true;
  driverSearching.value = true;
  try {
    const [cars, drivers] = await Promise.all([
      carsStore.getCarSuggestions(20),
      driversStore.getDriverSuggestions(20),
    ]);
    carSuggestions.value = cars;
    driverSuggestions.value = drivers;
    if (localCarId.value) {
      const matched = cars.find((c) => c.id === localCarId.value) ?? null;
      selectedCar.value = matched;
    }
    if (localDriverId.value) {
      const matched =
        drivers.find((d) => d.id === localDriverId.value) ?? null;
      selectedDriver.value = matched;
    }
  } finally {
    carSearching.value = false;
    driverSearching.value = false;
  }
}

function onCarSearchInput(queryRaw: string) {
  const query = queryRaw.trim().toLowerCase();

  if (carSearchTimer) clearTimeout(carSearchTimer);
  carSearchTimer = setTimeout(async () => {
    carSearching.value = true;
    try {
      const cars = await carsStore.getCarSuggestions(30);
      carSuggestions.value = query.length
        ? cars.filter((c) => {
            const model = c.model.toLowerCase();
            const plate = c.plateNumber?.toLowerCase() ?? '';
            return model.includes(query) || plate.includes(query);
          })
        : cars;
    } finally {
      carSearching.value = false;
    }
  }, 350);
}

function onDriverSearchInput(queryRaw: string) {
  const query = queryRaw.trim();

  if (driverSearchTimer) clearTimeout(driverSearchTimer);
  driverSearchTimer = setTimeout(async () => {
    driverSearching.value = true;
    try {
      driverSuggestions.value = query.length
        ? await driversStore.searchDrivers(query, 20)
        : await driversStore.getDriverSuggestions(20);
    } finally {
      driverSearching.value = false;
    }
  }, 350);
}

function pickCar(car: CarDto) {
  selectedCar.value = car;
  localCarId.value = car.id;
}

function clearCar() {
  selectedCar.value = null;
  localCarId.value = '';
}

function pickDriver(driver: DriverDto) {
  selectedDriver.value = driver;
  localDriverId.value = driver.id;
}

function clearDriver() {
  selectedDriver.value = null;
  localDriverId.value = '';
}

const carOptions = computed(() =>
  carSuggestions.value.map((c) => ({
    id: c.id,
    label: carLabel(c),
    meta: c.plateNumber || '—',
  })),
);

const driverOptions = computed(() =>
  driverSuggestions.value.map((d) => ({
    id: d.id,
    label: driverLabel(d),
    meta: d.email || d.phoneNumber || '—',
  })),
);

async function onSubmit() {
  formError.value = null;
  if (!form.amount.trim() || !form.occurredAt.trim()) {
    formError.value = t('appSections.fleet.vehicleDetails.incomeDialog.validation');
    return;
  }
  if (!localCarId.value || !localDriverId.value) {
    formError.value = t('appSections.fleet.vehicleDetails.incomeDialog.validation');
    return;
  }

  const payload: CreateIncomeDto = {
    amount: form.amount.trim(),
    currency: editingCurrency.value || 'PLN',
    occurredAt: toIsoDateString(form.occurredAt.trim()),
    title: form.title.trim() || undefined,
    notes: form.notes.trim() || undefined,
    carId: localCarId.value,
    driverId: localDriverId.value,
  };

  try {
    if (editingIncomeId.value) {
      await incomesStore.updateIncome(editingIncomeId.value, payload);
    } else {
      await incomesStore.createIncome(payload);
    }
    emit('created');
    close();
  } catch {
    formError.value = t('appSections.fleet.vehicleDetails.incomeDialog.error');
  }
}

defineExpose({ showModal, showModalForEdit, close });
</script>

<template>
  <EntityDialogShell
    ref="dialogShell"
    title-id="add-income-dialog-title"
    :title="incomeDialogTitle"
    :lead="incomeDialogLead"
    @close="resetDialogState"
  >
    <template #body>
      <form id="add-income-form" class="income-dialog__form" @submit.prevent="onSubmit">
        <section class="income-dialog__card income-dialog__card--active">
          <div class="income-dialog__accent" aria-hidden="true" />
          <div class="income-dialog__card-head">
            <div class="income-dialog__card-title-wrap">
              <span class="material-symbols-outlined" aria-hidden="true">payments</span>
              <h3 class="income-dialog__card-title">
                {{ incomeDialogTitle }}
              </h3>
            </div>
          </div>

          <div class="income-dialog__field income-dialog__field--full income-dialog__related-block">
            <div class="income-dialog__grid income-dialog__grid--selectors">
              <div class="income-dialog__field">
                <span class="income-dialog__field-label">
                  {{ `${t('appSections.fleet.vehicleDetails.incomeDialog.linkedCar')} *` }}
                </span>
                <SearchableSelect
                  :model-value="localCarId"
                  input-id="income-linked-car"
                  :aria-label="t('appSections.fleet.vehicleDetails.incomeDialog.linkedCar')"
                  :placeholder="t('appSections.fleet.addVehicleDriverUnassigned')"
                  :selected-label="selectedCar ? carLabel(selectedCar) : ''"
                  :search-placeholder="t('appSections.fleet.vehicleDetails.incomeDialog.searchCarPlaceholder')"
                  :options="carOptions"
                  :loading="carSearching"
                  :empty-option-label="t('appSections.fleet.addVehicleDriverUnassigned')"
                  @open="loadInitialSuggestions()"
                  @search="onCarSearchInput"
                  @update:model-value="
                    (value) => {
                      if (!value) {
                        clearCar();
                        return;
                      }
                      const picked = carSuggestions.find((c) => c.id === value);
                      if (picked) pickCar(picked);
                    }
                  "
                />
              </div>

              <div class="income-dialog__field">
                <span class="income-dialog__field-label">
                  {{ `${t('appSections.fleet.vehicleDetails.incomeDialog.linkedDriver')} *` }}
                </span>
                <SearchableSelect
                  :model-value="localDriverId"
                  input-id="income-linked-driver"
                  :aria-label="t('appSections.fleet.vehicleDetails.incomeDialog.linkedDriver')"
                  :placeholder="t('appSections.fleet.addVehicleDriverUnassigned')"
                  :selected-label="selectedDriver ? driverLabel(selectedDriver) : ''"
                  :search-placeholder="t('appSections.drivers.searchPlaceholder')"
                  :options="driverOptions"
                  :loading="driverSearching"
                  :empty-option-label="t('appSections.fleet.addVehicleDriverUnassigned')"
                  @open="loadInitialSuggestions()"
                  @search="onDriverSearchInput"
                  @update:model-value="
                    (value) => {
                      if (!value) {
                        clearDriver();
                        return;
                      }
                      const picked = driverSuggestions.find((d) => d.id === value);
                      if (picked) pickDriver(picked);
                    }
                  "
                />
              </div>
            </div>
          </div>

          <div class="income-dialog__grid">
            <label class="income-dialog__field">
              <span>{{ `${t('appSections.fleet.vehicleDetails.incomeDialog.amount')} *` }}</span>
              <input
                id="income-amount"
                v-model="form.amount"
                class="ti-input income-dialog__input"
                type="text"
                inputmode="decimal"
                placeholder="1499.99"
                required
              >
            </label>

            <div class="income-dialog__field">
              <span>{{ `${t('appSections.fleet.vehicleDetails.incomeDialog.occurredAt')} *` }}</span>
              <FleetDateInput
                v-model="form.occurredAt"
                input-id="income-occurred-at"
                :title="t('appSections.fleet.vehicleDetails.incomeDialog.occurredAt')"
              />
            </div>

            <label class="income-dialog__field income-dialog__field--full">
              <span>{{ t('appSections.fleet.vehicleDetails.incomeDialog.titleField') }}</span>
              <input
                id="income-title"
                v-model="form.title"
                class="ti-input income-dialog__input"
                type="text"
                :placeholder="t('appSections.fleet.vehicleDetails.incomeDialog.titlePlaceholder')"
              >
            </label>

            <label class="income-dialog__field income-dialog__field--full">
              <span>{{ t('appSections.fleet.vehicleDetails.incomeDialog.notes') }}</span>
              <textarea
                id="income-notes"
                v-model="form.notes"
                class="ti-input income-dialog__input income-dialog__textarea"
                rows="3"
                :placeholder="t('appSections.fleet.vehicleDetails.incomeDialog.notesPlaceholder')"
              />
            </label>
          </div>
        </section>
      </form>
    </template>
    <template #footer>
      <div class="income-dialog__footer">
        <p v-if="formError" class="income-dialog__error" role="alert">{{ formError }}</p>
        <button type="button" class="income-dialog__btn income-dialog__btn--ghost" @click="close">
          {{ t('appSections.fleet.addVehicleCancel') }}
        </button>
        <button
          form="add-income-form"
          type="submit"
          class="income-dialog__btn income-dialog__btn--primary"
          :disabled="incomesStore.creating || incomesStore.updating"
        >
          {{
            incomesStore.creating || incomesStore.updating
              ? t('common.loading')
              : editingIncomeId
                ? t('appSections.fleet.vehicleDetails.save')
                : t('appSections.fleet.vehicleDetails.incomeDialog.submit')
          }}
        </button>
      </div>
    </template>
  </EntityDialogShell>
</template>

<style scoped>
.income-dialog__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.income-dialog__card {
  border-radius: 0.75rem;
  background: var(--color-surface-container-lowest);
  box-shadow: var(--shadow-ambient);
  position: relative;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.income-dialog__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--color-secondary);
  border-radius: 0.75rem 0 0 0.75rem;
}

.income-dialog__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.income-dialog__card-title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-secondary);
}

.income-dialog__card-title {
  margin: 0;
  color: var(--color-on-surface);
  font-size: 1rem;
  font-weight: 700;
}

.income-dialog__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 1rem;
  row-gap: 0.95rem;
}

.income-dialog__grid--selectors {
  align-items: start;
  row-gap: 0.6rem;
}

.income-dialog__field {
  min-width: 0;
}

.income-dialog__field--full {
  grid-column: 1 / -1;
}

.income-dialog__field > span,
.income-dialog__field-label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.income-dialog__input {
  width: 100%;
}

.income-dialog__textarea {
  resize: vertical;
  min-height: 5rem;
}

.income-dialog__related-block {
  padding-bottom: 0.25rem;
}

.income-dialog__footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.55rem;
}

.income-dialog__error {
  margin: 0;
  margin-right: auto;
  align-self: center;
  font-size: 0.8125rem;
  color: var(--color-error);
}

.income-dialog__btn {
  border: none;
  border-radius: 0.75rem;
  padding: 0.65rem 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.18s ease, background-color 0.18s ease, filter 0.18s ease;
}

.income-dialog__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.income-dialog__btn--ghost {
  color: var(--color-on-surface);
  background: transparent;
}

.income-dialog__btn--ghost:hover:not(:disabled) {
  background: var(--color-surface-container-high);
}

.income-dialog__btn--primary {
  color: var(--color-on-secondary);
  background: var(--color-secondary);
}

.income-dialog__btn--primary:hover:not(:disabled) {
  filter: brightness(1.06);
}

@media (max-width: 34rem) {
  .income-dialog__grid {
    grid-template-columns: 1fr;
  }
}
</style>
