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
      <form id="add-expense-form" class="app-dialog-form" @submit.prevent="onSubmit">
        <AppDialogSection
          icon="receipt_long"
          :title="t('appSections.fleet.vehicleDetails.expenseDialog.title')"
        >
          <label class="app-dialog-field app-dialog-field--full">
            <span>{{ t('appSections.fleet.vehicleDetails.expenseDialog.type') }}</span>
            <select
              id="expense-type"
              v-model="form.type"
              class="ti-input app-dialog-select"
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

          <div class="app-dialog-field app-dialog-field--full">
            <div class="app-dialog-grid app-dialog-grid--2">
              <div class="app-dialog-field">
                <span class="app-dialog-field__label app-dialog-field__label--inline">
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

              <div v-if="showsDriverRelation" class="app-dialog-field">
                <span class="app-dialog-field__label app-dialog-field__label--inline">
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

          <div class="app-dialog-grid app-dialog-grid--2">
            <label v-if="isCarPaymentType" class="app-dialog-field">
              <span>{{ t('appSections.fleet.vehicleDetails.expenseDialog.carPaymentKind') }}</span>
              <select
                id="expense-car-payment-kind"
                v-model="form.carPaymentKind"
                class="ti-input app-dialog-select"
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

            <label class="app-dialog-field">
              <span>{{ `${t('appSections.fleet.vehicleDetails.expenseDialog.amount')} *` }}</span>
              <input
                id="expense-amount"
                v-model="form.amount"
                class="ti-input"
                type="text"
                inputmode="decimal"
                placeholder="1499.99"
                required
              >
            </label>

            <label class="app-dialog-field app-dialog-field--full">
              <span>{{ `${t('appSections.fleet.vehicleDetails.expenseDialog.titleField')} *` }}</span>
              <input
                id="expense-title"
                v-model="form.title"
                class="ti-input"
                type="text"
                :placeholder="t('appSections.fleet.vehicleDetails.expenseDialog.titlePlaceholder')"
                required
              >
            </label>

            <div class="app-dialog-field">
              <span>{{ `${t('appSections.fleet.vehicleDetails.expenseDialog.occurredAt')} *` }}</span>
              <FleetDateInput
                v-model="form.occurredAt"
                input-id="expense-occurred-at"
                :title="t('appSections.fleet.vehicleDetails.expenseDialog.occurredAt')"
              />
            </div>

            <label class="app-dialog-field app-dialog-field--full">
              <span>{{ t('appSections.fleet.vehicleDetails.expenseDialog.notes') }}</span>
              <textarea
                id="expense-notes"
                v-model="form.notes"
                class="ti-input app-dialog-textarea"
                rows="3"
                :placeholder="t('appSections.fleet.vehicleDetails.expenseDialog.notesPlaceholder')"
              />
            </label>

          </div>
        </AppDialogSection>
      </form>
    </template>
    <template #footer>
      <AppDialogFooter
        :error="formError"
        :cancel-label="t('appSections.fleet.addVehicleCancel')"
        :submit-label="t('appSections.fleet.vehicleDetails.expenseDialog.submit')"
        :submit-disabled="expensesStore.creating"
        form-id="add-expense-form"
        @cancel="close"
      />
    </template>
  </EntityDialogShell>
</template>
