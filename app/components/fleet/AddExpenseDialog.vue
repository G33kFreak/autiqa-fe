<script setup lang="ts">
import type { CarDto } from '#shared/dto/car.dto';
import type { CreateExpenseDto } from '#shared/dto/create-expense.dto';
import type { DriverDto } from '#shared/dto/driver.dto';
import EntityDialogShell from '~/components/shared/EntityDialogShell.vue';
import SearchableSelect from '~/components/shared/SearchableSelect.vue';

const props = withDefaults(defineProps<{
  initialCarId?: string;
}>(), {
  initialCarId: '',
});

const emit = defineEmits<{
  created: [];
}>();

const { t } = useI18n();
const expensesStore = useExpensesStore();
const driversStore = useDriversStore();
const carsStore = useCarsStore();

const dialogShell = ref<InstanceType<typeof EntityDialogShell> | null>(null);
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

type ExpenseFormModel = {
  type: string;
  amount: string;
  occurredAt: string;
  title: string;
  notes: string;
  carPaymentKind: string;
};

function getTodayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

const form = reactive<ExpenseFormModel>({
  type: 'MAINTENANCE',
  amount: '',
  occurredAt: getTodayDateInputValue(),
  title: '',
  notes: '',
  carPaymentKind: '',
});

const expenseTypeOptions = [
  'MAINTENANCE',
  'CAR_PAYMENT',
  'INSURANCE',
  'FEE',
  'OTHER',
] as const;

const carPaymentKindOptions = ['BUY', 'LEASE'] as const;

const isCarPaymentType = computed(() => form.type === 'CAR_PAYMENT');
const showsDriverRelation = computed(
  () => form.type === 'FEE' || form.type === 'OTHER',
);
const requiresCarRelation = computed(
  () =>
    form.type === 'MAINTENANCE'
    || form.type === 'FEE'
    || form.type === 'CAR_PAYMENT'
    || form.type === 'INSURANCE',
);
const requiresDriverRelation = computed(() => form.type === 'FEE');

watch(
  () => form.type,
  () => {
    if (!isCarPaymentType.value) {
      form.carPaymentKind = '';
    }
    if (!showsDriverRelation.value) {
      clearDriver();
    }
  },
);

function showModal(presetType?: (typeof expenseTypeOptions)[number]) {
  resetForm(presetType);
  dialogShell.value?.showModal();
  void loadInitialSuggestions();
}

function close() {
  dialogShell.value?.close();
}

function toIsoDateString(dateInput: string): string {
  return new Date(`${dateInput}T12:00:00.000Z`).toISOString();
}

function resetForm(presetType?: (typeof expenseTypeOptions)[number]) {
  formError.value = null;
  form.type = presetType ?? 'MAINTENANCE';
  form.amount = '';
  form.occurredAt = getTodayDateInputValue();
  form.title = '';
  form.notes = '';
  form.carPaymentKind = '';
  selectedCar.value = null;
  selectedDriver.value = null;
  localCarId.value = props.initialCarId || '';
  localDriverId.value = '';
}

function resetDialogState() {
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
      const matched = cars.find((car) => car.id === localCarId.value) ?? null;
      selectedCar.value = matched;
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
        ? cars.filter((car) => {
            const model = car.model.toLowerCase();
            const plate = car.plateNumber?.toLowerCase() ?? '';
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
  carSuggestions.value.map((car) => ({
    id: car.id,
    label: carLabel(car),
    meta: car.plateNumber || '—',
  })),
);

const driverOptions = computed(() =>
  driverSuggestions.value.map((driver) => ({
    id: driver.id,
    label: driverLabel(driver),
    meta: driver.email || driver.phoneNumber || '—',
  })),
);

async function onSubmit() {
  formError.value = null;
  if (!form.title.trim() || !form.amount.trim() || !form.occurredAt.trim()) {
    formError.value = t('appSections.fleet.vehicleDetails.expenseDialog.validation');
    return;
  }
  if (requiresCarRelation.value && !localCarId.value) {
    formError.value = t('appSections.fleet.vehicleDetails.expenseDialog.validation');
    return;
  }
  if (requiresDriverRelation.value && !localDriverId.value) {
    formError.value = t('appSections.fleet.vehicleDetails.expenseDialog.validation');
    return;
  }

  const payload: CreateExpenseDto = {
    type: form.type,
    amount: form.amount.trim(),
    currency: 'PLN',
    occurredAt: toIsoDateString(form.occurredAt.trim()),
    title: form.title.trim(),
    notes: form.notes.trim() || undefined,
    carPaymentKind: isCarPaymentType.value ? form.carPaymentKind.trim() || undefined : undefined,
    carId: localCarId.value || undefined,
    driverId: showsDriverRelation.value ? localDriverId.value || undefined : undefined,
  };

  try {
    await expensesStore.createExpense(payload);
    emit('created');
    close();
  } catch {
    formError.value = t('appSections.fleet.vehicleDetails.expenseDialog.error');
  }
}

defineExpose({ showModal, close });
</script>

<template>
  <EntityDialogShell
    ref="dialogShell"
    title-id="add-expense-dialog-title"
    :title="t('appSections.fleet.vehicleDetails.expenseDialog.title')"
    :lead="t('appSections.fleet.vehicleDetails.expenseDialog.lead')"
    @close="resetDialogState"
  >
    <template #body>
      <form id="add-expense-form" class="expense-dialog__form" @submit.prevent="onSubmit">
        <section class="expense-dialog__card expense-dialog__card--active">
          <div class="expense-dialog__accent" aria-hidden="true" />
          <div class="expense-dialog__card-head">
            <div class="expense-dialog__card-title-wrap">
              <span class="material-symbols-outlined" aria-hidden="true">receipt_long</span>
              <h3 class="expense-dialog__card-title">
                {{ t('appSections.fleet.vehicleDetails.expenseDialog.title') }}
              </h3>
            </div>
          </div>

          <label class="expense-dialog__field expense-dialog__field--full">
            <span>{{ t('appSections.fleet.vehicleDetails.expenseDialog.type') }}</span>
            <select
              id="expense-type"
              v-model="form.type"
              class="ti-input expense-dialog__input expense-dialog__select"
              required
            >
              <option
                v-for="option in expenseTypeOptions"
                :key="option"
                :value="option"
              >
                {{ t(`appSections.fleet.vehicleDetails.expenseDialog.expenseTypes.${option}`) }}
              </option>
            </select>
          </label>

          <div class="expense-dialog__field expense-dialog__field--full expense-dialog__related-block">
            <div class="expense-dialog__grid expense-dialog__grid--selectors">
              <div class="expense-dialog__field">
                <span class="expense-dialog__field-label">
                  {{ `${t('appSections.fleet.vehicleDetails.expenseDialog.linkedCar')}${requiresCarRelation ? ' *' : ''}` }}
                </span>
                <SearchableSelect
                  :model-value="localCarId"
                  input-id="expense-linked-car"
                  :aria-label="t('appSections.fleet.vehicleDetails.expenseDialog.linkedCar')"
                  :placeholder="t('appSections.fleet.addVehicleDriverUnassigned')"
                  :selected-label="selectedCar ? carLabel(selectedCar) : ''"
                  :search-placeholder="t('appSections.fleet.vehicleDetails.expenseDialog.searchCarPlaceholder')"
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
                      const picked = carSuggestions.find((car) => car.id === value);
                      if (picked) pickCar(picked);
                    }
                  "
                />
              </div>

              <div v-if="showsDriverRelation" class="expense-dialog__field">
                <span class="expense-dialog__field-label">
                  {{ `${t('appSections.fleet.vehicleDetails.expenseDialog.linkedDriver')}${requiresDriverRelation ? ' *' : ''}` }}
                </span>
                <SearchableSelect
                  :model-value="localDriverId"
                  input-id="expense-linked-driver"
                  :aria-label="t('appSections.fleet.vehicleDetails.expenseDialog.linkedDriver')"
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
                      const picked = driverSuggestions.find((driver) => driver.id === value);
                      if (picked) pickDriver(picked);
                    }
                  "
                />
              </div>
            </div>
          </div>

          <div class="expense-dialog__grid">
            <label v-if="isCarPaymentType" class="expense-dialog__field">
              <span>{{ t('appSections.fleet.vehicleDetails.expenseDialog.carPaymentKind') }}</span>
              <select
                id="expense-car-payment-kind"
                v-model="form.carPaymentKind"
                class="ti-input expense-dialog__input expense-dialog__select"
              >
                <option value="">
                  {{ t('appSections.fleet.vehicleDetails.expenseDialog.selectCarPaymentKind') }}
                </option>
                <option
                  v-for="option in carPaymentKindOptions"
                  :key="option"
                  :value="option"
                >
                  {{ t(`appSections.fleet.vehicleDetails.expenseDialog.carPaymentKinds.${option}`) }}
                </option>
              </select>
            </label>

            <label class="expense-dialog__field">
              <span>{{ `${t('appSections.fleet.vehicleDetails.expenseDialog.amount')} *` }}</span>
              <input
                id="expense-amount"
                v-model="form.amount"
                class="ti-input expense-dialog__input"
                type="text"
                inputmode="decimal"
                placeholder="1499.99"
                required
              >
            </label>

            <label class="expense-dialog__field expense-dialog__field--full">
              <span>{{ `${t('appSections.fleet.vehicleDetails.expenseDialog.titleField')} *` }}</span>
              <input
                id="expense-title"
                v-model="form.title"
                class="ti-input expense-dialog__input"
                type="text"
                :placeholder="t('appSections.fleet.vehicleDetails.expenseDialog.titlePlaceholder')"
                required
              >
            </label>

            <div class="expense-dialog__field">
              <span>{{ `${t('appSections.fleet.vehicleDetails.expenseDialog.occurredAt')} *` }}</span>
              <FleetDateInput
                v-model="form.occurredAt"
                input-id="expense-occurred-at"
                :title="t('appSections.fleet.vehicleDetails.expenseDialog.occurredAt')"
              />
            </div>

            <label class="expense-dialog__field expense-dialog__field--full">
              <span>{{ t('appSections.fleet.vehicleDetails.expenseDialog.notes') }}</span>
              <textarea
                id="expense-notes"
                v-model="form.notes"
                class="ti-input expense-dialog__input expense-dialog__textarea"
                rows="3"
                :placeholder="t('appSections.fleet.vehicleDetails.expenseDialog.notesPlaceholder')"
              />
            </label>

          </div>
        </section>
      </form>
    </template>
    <template #footer>
      <div class="expense-dialog__footer">
        <p v-if="formError" class="expense-dialog__error" role="alert">{{ formError }}</p>
        <button type="button" class="expense-dialog__btn expense-dialog__btn--ghost" @click="close">
          {{ t('appSections.fleet.addVehicleCancel') }}
        </button>
        <button
          form="add-expense-form"
          type="submit"
          class="expense-dialog__btn expense-dialog__btn--primary"
          :disabled="expensesStore.creating"
        >
          {{ t('appSections.fleet.vehicleDetails.expenseDialog.submit') }}
        </button>
      </div>
    </template>
  </EntityDialogShell>
</template>

<style scoped>
.expense-dialog__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.expense-dialog__card {
  border-radius: 0.75rem;
  background: var(--color-surface-container-lowest);
  box-shadow: var(--shadow-ambient);
  position: relative;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.expense-dialog__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--color-secondary);
  border-radius: 0.75rem 0 0 0.75rem;
}

.expense-dialog__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.expense-dialog__card-title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-secondary);
}

.expense-dialog__card-title {
  margin: 0;
  color: var(--color-on-surface);
  font-size: 1rem;
  font-weight: 700;
}

.expense-dialog__card-label {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.expense-dialog__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 1rem;
  row-gap: 0.95rem;
}

.expense-dialog__grid--selectors {
  align-items: start;
  row-gap: 0.6rem;
}

.expense-dialog__field {
  min-width: 0;
}

.expense-dialog__field--full {
  grid-column: 1 / -1;
}

.expense-dialog__field > span,
.expense-dialog__field-label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.expense-dialog__input {
  width: 100%;
}

.expense-dialog__textarea {
  resize: vertical;
  min-height: 5rem;
}

.expense-dialog__select {
  appearance: none;
  cursor: pointer;
  padding-right: 2.35rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none'%3E%3Cpath stroke='%239aa0a6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.65rem center;
  background-size: 1.125rem;
}

.expense-dialog__related-block {
  padding-bottom: 0.25rem;
}

.expense-dialog__footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.55rem;
}

.expense-dialog__error {
  margin: 0;
  margin-right: auto;
  align-self: center;
  font-size: 0.8125rem;
  color: var(--color-error);
}

.expense-dialog__btn {
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

.expense-dialog__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.expense-dialog__btn--ghost {
  color: var(--color-on-surface);
  background: transparent;
}

.expense-dialog__btn--ghost:hover:not(:disabled) {
  background: var(--color-surface-container-high);
}

.expense-dialog__btn--primary {
  color: var(--color-on-secondary);
  background: var(--color-secondary);
}

.expense-dialog__btn--primary:hover:not(:disabled) {
  filter: brightness(1.06);
}

@media (max-width: 34rem) {
  .expense-dialog__grid {
    grid-template-columns: 1fr;
  }
}
</style>
