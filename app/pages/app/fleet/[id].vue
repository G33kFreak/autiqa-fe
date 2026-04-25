<script setup lang="ts">
import type { CarDto } from '#shared/dto/car.dto';
import type { CreateCarDto } from '#shared/dto/create-car.dto';
import type { DriverDto } from '#shared/dto/driver.dto';
import type { ExpenseDto } from '#shared/dto/expense.dto';
import type { ExpenseSummaryItemDto } from '#shared/dto/expense-summary-item.dto';
import AddExpenseDialog from '~/components/fleet/AddExpenseDialog.vue';
import EntityDialogShell from '~/components/shared/EntityDialogShell.vue';

const { t } = useI18n();
const route = useRoute();
const carsStore = useCarsStore();
const driversStore = useDriversStore();
const expensesStore = useExpensesStore();

const carId = computed(() => String(route.params.id || ''));
const detailsLoading = ref(true);
const detailsResolved = ref(false);
const car = ref<CarDto | null>(null);
const carName = ref('');
const registrationNumber = ref('');
const vin = ref('');
const assignDialog = ref<InstanceType<typeof EntityDialogShell> | null>(null);
const assignSearchInput = ref('');
const assignSuggestions = ref<DriverDto[]>([]);
const assignSearching = ref(false);
let assignSearchTimer: ReturnType<typeof setTimeout> | null = null;

const inspectionValidUntil = '2026-09-12';
const insurance = {
  provider: 'PZU',
  policyNumber: 'PZU-99231',
  validUntil: '2026-11-30',
};

const addExpenseDialog = ref<InstanceType<typeof AddExpenseDialog> | null>(null);
const feeExpenses = ref<ExpenseDto[]>([]);
const maintenanceExpenses = ref<ExpenseDto[]>([]);
const feesPage = ref(1);
const maintenancePage = ref(1);
const feesLimit = 10;
const maintenanceLimit = 10;
const feesHasMore = ref(false);
const maintenanceHasMore = ref(false);
const feesLoadingMore = ref(false);
const maintenanceLoadingMore = ref(false);
const expenseSummaryItems = ref<ExpenseSummaryItemDto[]>([]);

const carFees = computed(() =>
  [...feeExpenses.value]
    .sort(
      (a: ExpenseDto, b: ExpenseDto) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    )
    .map((expense: ExpenseDto) => ({
      label: expense.title,
      dueDate: expense.occurredAt.slice(0, 10),
      value: Math.abs(Number(expense.amount) || 0),
    })),
);

const totalIncome = computed(() => {
  const summaryItem = expenseSummaryItems.value.find((item) => item.type === 'INCOME');
  return Number(summaryItem?.totalAmount ?? 0) || 0;
});

const maintenanceHistory = computed(() =>
  [...maintenanceExpenses.value]
    .sort(
      (a: ExpenseDto, b: ExpenseDto) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    )
    .map((expense: ExpenseDto) => ({
      date: expense.occurredAt.slice(0, 10),
      title: expense.title,
      amount: Number(expense.amount) || 0,
      notes: expense.notes || '—',
    })),
);

const totalFees = computed(() => {
  const summaryItem = expenseSummaryItems.value.find((item) => item.type === 'FEE');
  return Number(summaryItem?.totalAmount ?? 0) || 0;
});
const totalMaintenance = computed(() => {
  const summaryItem = expenseSummaryItems.value.find(
    (item) => item.type === 'MAINTENANCE',
  );
  return Number(summaryItem?.totalAmount ?? 0) || 0;
});
const totalOtherExpenses = computed(() =>
  expenseSummaryItems.value.reduce((sum, item) => {
    if (item.type === 'INCOME' || item.type === 'MAINTENANCE' || item.type === 'FEE') {
      return sum;
    }
    return sum + (Number(item.totalAmount ?? 0) || 0);
  }, 0),
);
const totalCombinedExpenses = computed(
  () => totalFees.value + totalMaintenance.value + totalOtherExpenses.value,
);
const totalProfitLoss = computed(() => totalIncome.value - totalCombinedExpenses.value);
const isProfit = computed(() => totalProfitLoss.value >= 0);

const complianceItems = [
  {
    title: t('appSections.fleet.vehicleDetails.complianceItems.technicalInspection'),
    validUntil: inspectionValidUntil,
    attachments: ['inspection-report.pdf'],
  },
  {
    title: t('appSections.fleet.vehicleDetails.complianceItems.ocAcPolicy'),
    validUntil: insurance.validUntil,
    attachments: ['policy-main.pdf', 'policy-ac-annex.pdf'],
  },
];
const driverCard = computed(() => {
  if (!car.value?.driver) return { name: '', phone: '' };
  return {
    name: `${car.value.driver.firstName} ${car.value.driver.lastName}`.trim(),
    phone: '',
  };
});

async function fetchFees(page: number, append = false): Promise<void> {
  const response = await expensesStore.fetchExpenses({
    page,
    limit: feesLimit,
    carId: carId.value,
    type: 'FEE',
  });
  feeExpenses.value = append
    ? [...feeExpenses.value, ...response.data]
    : response.data;
  feesPage.value = response.meta.page;
  feesHasMore.value = response.meta.hasNextPage;
}

async function fetchMaintenance(page: number, append = false): Promise<void> {
  const response = await expensesStore.fetchExpenses({
    page,
    limit: maintenanceLimit,
    carId: carId.value,
    type: 'MAINTENANCE',
  });
  maintenanceExpenses.value = append
    ? [...maintenanceExpenses.value, ...response.data]
    : response.data;
  maintenancePage.value = response.meta.page;
  maintenanceHasMore.value = response.meta.hasNextPage;
}

async function fetchExpensesSummary(): Promise<void> {
  const response = await expensesStore.fetchExpensesSummary({
    carId: carId.value,
  });
  expenseSummaryItems.value = response.items;
}

useSeoMeta({
  title: computed(() => `${t('appSections.fleet.vehicleDetailsTitle')} #${carId.value}`),
  description: computed(() => t('appSections.fleet.vehicleDetailsLead')),
});

onMounted(async () => {
  detailsLoading.value = true;
  try {
    const [fetchedCar] = await Promise.all([
      carsStore.getViewModelById(carId.value),
      fetchFees(1),
      fetchMaintenance(1),
      fetchExpensesSummary(),
    ]);
    car.value = fetchedCar;
    carName.value = car.value?.model ?? '';
    registrationNumber.value = car.value?.plateNumber ?? '';
    vin.value = car.value?.vin ?? '';
  } finally {
    detailsLoading.value = false;
    detailsResolved.value = true;
  }
});

function handleAssignOther() {
  assignDialog.value?.showModal();
  assignSearchInput.value = '';
  assignSearching.value = true;
  void driversStore.getDriverSuggestions(10).then((items) => {
    assignSuggestions.value = items;
  }).finally(() => {
    assignSearching.value = false;
  });
}

async function handleRemoveDriver() {
  if (!car.value) return;
  const updated = await carsStore.unassignDriverFromCar(car.value.id);
  car.value = updated;
}

function resetAssignDialogState() {
  assignSearchInput.value = '';
  assignSuggestions.value = [];
  assignSearching.value = false;
  if (assignSearchTimer) {
    clearTimeout(assignSearchTimer);
    assignSearchTimer = null;
  }
}

function closeAssignDialog() {
  assignDialog.value?.close();
  resetAssignDialogState();
}

function onAssignSearchInput(event: Event) {
  const el = event.target as HTMLInputElement;
  assignSearchInput.value = el.value;
  const query = assignSearchInput.value.trim();

  if (assignSearchTimer) clearTimeout(assignSearchTimer);
  assignSearchTimer = setTimeout(async () => {
    assignSearching.value = true;
    try {
      assignSuggestions.value = query.length
        ? await driversStore.searchDrivers(query, 10)
        : await driversStore.getDriverSuggestions(10);
    } finally {
      assignSearching.value = false;
    }
  }, 450);
}

function handleOpenAddExpenseDialog() {
  addExpenseDialog.value?.showModal();
}

async function handleExpenseCreated() {
  await Promise.all([
    fetchFees(1),
    fetchMaintenance(1),
    fetchExpensesSummary(),
  ]);
}

async function handleLoadMoreFees() {
  if (feesLoadingMore.value || !feesHasMore.value) return;
  feesLoadingMore.value = true;
  try {
    await fetchFees(feesPage.value + 1, true);
  } finally {
    feesLoadingMore.value = false;
  }
}

async function handleLoadMoreMaintenance() {
  if (maintenanceLoadingMore.value || !maintenanceHasMore.value) return;
  maintenanceLoadingMore.value = true;
  try {
    await fetchMaintenance(maintenancePage.value + 1, true);
  } finally {
    maintenanceLoadingMore.value = false;
  }
}

async function assignDriver(driver: DriverDto) {
  if (!car.value) return;
  const updated = await carsStore.assignDriverToCar(car.value.id, driver.id);
  car.value = updated;
  closeAssignDialog();
}

async function handleUpdateVehicleInfo(payload: {
  carName: string;
  registrationNumber: string;
  vin: string;
}) {
  if (!car.value) return;
  const updatePayload: CreateCarDto = {
    model: payload.carName,
    plateNumber: payload.registrationNumber || undefined,
    vin: payload.vin || undefined,
    inspectionValidUntil: car.value.inspectionValidUntil || undefined,
  };
  const updated = await carsStore.updateCar(car.value.id, updatePayload);
  car.value = updated;
  carName.value = updated.model ?? '';
  registrationNumber.value = updated.plateNumber ?? '';
  vin.value = updated.vin ?? '';
}
</script>

<template>
  <section class="fleet-vehicle-page">
    <template v-if="detailsLoading && !detailsResolved">
      <div class="fleet-skeleton fleet-skeleton--header" />
      <section class="fleet-layout">
        <div class="fleet-layout__left">
          <div class="fleet-skeleton fleet-skeleton--card-lg" />
          <div class="fleet-skeleton fleet-skeleton--card-md" />
        </div>
        <div class="fleet-layout__right">
          <div class="fleet-skeleton fleet-skeleton--card-md" />
          <div class="fleet-skeleton fleet-skeleton--card-lg" />
        </div>
      </section>
    </template>
    <template v-else>
    <FleetVehicleHeader
      :overline="t('appSections.fleet.vehicleDetails.commandView')"
      :car-name="carName"
      :plate-label="t('appSections.fleet.table.plate')"
      :registration-number="registrationNumber"
      :vin-label="t('appSections.fleet.table.vin')"
      :vin="vin"
      :edit-info-label="t('appSections.fleet.vehicleDetails.editInfo')"
      :save-label="t('appSections.fleet.vehicleDetails.save')"
      :saving-label="t('common.loading')"
      :cancel-label="t('appSections.fleet.vehicleDetails.cancel')"
      :is-saving="carsStore.updating"
      @update-info="handleUpdateVehicleInfo"
    />

    <section class="fleet-layout">
      <div class="fleet-layout__left">
        <FleetFinancialSummaryCard
          :total-income="totalIncome"
          :total-fees="totalFees"
          :total-maintenance="totalMaintenance"
          :total-other-expenses="totalOtherExpenses"
          :total-combined-expenses="totalCombinedExpenses"
          :total-profit-loss="totalProfitLoss"
          :is-profit="isProfit"
        />
        <FleetFeesCard :items="carFees" />
        <button
          v-if="feesHasMore"
          type="button"
          class="fleet-load-more-btn"
          :disabled="feesLoadingMore"
          @click="handleLoadMoreFees"
        >
          {{ feesLoadingMore ? t('common.loading') : t('appSections.fleet.vehicleDetails.loadMore') }}
        </button>
      </div>

      <div class="fleet-layout__right">
        <FleetComplianceCard
          :compliance-items="complianceItems"
          :driver="driverCard"
          @assign-other="handleAssignOther"
          @remove-driver="handleRemoveDriver"
        />
        <FleetMaintenanceTimeline :items="maintenanceHistory">
          <template #header-action>
            <button
              type="button"
              class="fleet-maintenance-action"
              @click="handleOpenAddExpenseDialog"
            >
              <span class="material-symbols-outlined" aria-hidden="true">add</span>
              {{ t('appSections.fleet.vehicleDetails.expenseDialog.openCta') }}
            </button>
          </template>
        </FleetMaintenanceTimeline>
        <button
          v-if="maintenanceHasMore"
          type="button"
          class="fleet-load-more-btn"
          :disabled="maintenanceLoadingMore"
          @click="handleLoadMoreMaintenance"
        >
          {{ maintenanceLoadingMore ? t('common.loading') : t('appSections.fleet.vehicleDetails.loadMore') }}
        </button>
      </div>
    </section>

    <EntityDialogShell
      ref="assignDialog"
      title-id="fleet-assign-dialog-title"
      :title="t('appSections.fleet.vehicleDetails.assignOther')"
      width="min(30rem, calc(100vw - 2rem))"
      :lead="''"
      @close="resetAssignDialogState"
    >
      <template #body>
        <div class="fleet-assign-dialog__body">
          <label class="fleet-assign-dialog__search">
            <span class="material-symbols-outlined fleet-assign-dialog__search-icon" aria-hidden="true">search</span>
            <input
              :value="assignSearchInput"
              class="ti-input fleet-assign-dialog__search-input"
              type="text"
              :placeholder="t('appSections.drivers.searchPlaceholder')"
              @input="onAssignSearchInput"
            >
          </label>

          <div class="fleet-assign-dialog__list">
            <p v-if="assignSearching" class="fleet-assign-dialog__state">{{ t('common.loading') }}</p>
            <p v-else-if="assignSuggestions.length === 0" class="fleet-assign-dialog__state">
              {{ t('appSections.fleet.addVehicleDriverSearchNoResults') }}
            </p>
            <button
              v-for="driver in assignSuggestions"
              v-else
              :key="driver.id"
              type="button"
              class="fleet-assign-dialog__item"
              :disabled="carsStore.updating"
              @click="assignDriver(driver)"
            >
              <span class="fleet-assign-dialog__item-name">
                {{ `${driver.firstName} ${driver.lastName}`.trim() }}
              </span>
              <span class="fleet-assign-dialog__item-meta">
                {{ driver.email || driver.phoneNumber || t('appSections.drivers.details.common.emptyValue') }}
              </span>
            </button>
          </div>
        </div>
      </template>
    </EntityDialogShell>
    <AddExpenseDialog
      ref="addExpenseDialog"
      :initial-car-id="carId"
      @created="handleExpenseCreated"
    />
    </template>
  </section>
</template>

<style scoped>
.fleet-vehicle-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.fleet-layout {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 4.4fr) minmax(0, 7.6fr);
}

.fleet-layout__left {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fleet-layout__right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fleet-skeleton {
  border-radius: 1rem;
  background: linear-gradient(
    90deg,
    var(--color-surface-container-low) 0%,
    var(--color-surface-container) 50%,
    var(--color-surface-container-low) 100%
  );
  background-size: 220% 100%;
  animation: fleet-skeleton-shimmer 1.5s ease-in-out infinite;
}

.fleet-skeleton--header {
  min-height: 8.2rem;
}

.fleet-skeleton--card-lg {
  min-height: 18rem;
}

.fleet-skeleton--card-md {
  min-height: 12rem;
}

@keyframes fleet-skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 1120px) {
  .fleet-layout {
    grid-template-columns: 1fr;
  }
}

.fleet-assign-dialog__body {
  padding: 0.1rem 0;
}

.fleet-assign-dialog__search {
  position: relative;
  display: block;
}

.fleet-assign-dialog__search-icon {
  position: absolute;
  left: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-outline);
  font-size: 1rem;
  pointer-events: none;
}

.fleet-assign-dialog__search-input {
  padding-left: 2.2rem;
}

.fleet-assign-dialog__list {
  margin-top: 0.7rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  max-height: 16rem;
  overflow-y: auto;
}

.fleet-assign-dialog__state {
  margin: 0;
  color: var(--color-on-surface-variant);
  font-size: 0.8125rem;
}

.fleet-assign-dialog__item {
  border: none;
  border-radius: 0.65rem;
  padding: 0.55rem 0.65rem;
  background: var(--color-surface-container-low);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  cursor: pointer;
}

.fleet-assign-dialog__item:hover:not(:disabled) {
  background: var(--color-surface-container);
}

.fleet-assign-dialog__item:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.fleet-assign-dialog__item-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-on-surface);
}

.fleet-assign-dialog__item-meta {
  font-size: 0.75rem;
  color: var(--color-on-surface-variant);
}

.fleet-maintenance-action {
  border: none;
  border-radius: 0.75rem;
  padding: 0.48rem 0.72rem;
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;
  color: var(--color-on-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(
    135deg,
    var(--color-secondary) 0%,
    var(--color-secondary-container) 100%
  );
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.fleet-maintenance-action:hover {
  opacity: 0.94;
  transform: translateY(-1px);
}

.fleet-maintenance-action .material-symbols-outlined {
  font-size: 0.95rem;
}

.fleet-load-more-btn {
  align-self: flex-start;
  border: none;
  border-radius: 0.65rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-on-surface);
  background: var(--color-surface-container-high);
  cursor: pointer;
}

.fleet-load-more-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
