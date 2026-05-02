<script setup lang="ts">
import type { CarDto } from '#shared/dto/car.dto';
import type { CreateCarDto } from '#shared/dto/create-car.dto';
import type { DriverDto } from '#shared/dto/driver.dto';
import type { ExpenseDto } from '#shared/dto/expense.dto';
import type { ExpenseSummaryItemDto } from '#shared/dto/expense-summary-item.dto';
import type { IncomeDto } from '#shared/dto/income.dto';
import AddExpenseDialog from '~/components/fleet/AddExpenseDialog.vue';
import AddIncomeDialog from '~/components/fleet/AddIncomeDialog.vue';
import EntityDialogShell from '~/components/shared/EntityDialogShell.vue';
import ListEmptyState from '~/components/shared/ListEmptyState.vue';

const { t } = useI18n();
const route = useRoute();
const carsStore = useCarsStore();
const driversStore = useDriversStore();
const expensesStore = useExpensesStore();
const incomesStore = useIncomesStore();

const carId = computed(() => String(route.params.id || ''));
const detailsLoading = ref(true);
const detailsResolved = ref(false);
const car = ref<CarDto | null>(null);
const carName = ref('');
const registrationNumber = ref('');
const vin = ref('');
type VehicleLedgerTab = 'fees' | 'maintenance';
const vehicleLedgerTab = ref<VehicleLedgerTab>('fees');
const assignDialog = ref<InstanceType<typeof EntityDialogShell> | null>(null);
const assignSearchInput = ref('');
const assignSuggestions = ref<DriverDto[]>([]);
const assignSearching = ref(false);
let assignSearchTimer: ReturnType<typeof setTimeout> | null = null;

const addExpenseDialog = ref<InstanceType<typeof AddExpenseDialog> | null>(
  null,
);
const addIncomeDialog = ref<InstanceType<typeof AddIncomeDialog> | null>(null);
const editExpenseDialog = ref<InstanceType<typeof EntityDialogShell> | null>(
  null,
);
const deleteExpenseDialog = ref<InstanceType<typeof EntityDialogShell> | null>(
  null,
);
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
const incomeRecords = ref<IncomeDto[]>([]);
const activeMaintenanceExpenseId = ref<string | null>(null);
const maintenanceFormError = ref<string | null>(null);
const deleteExpenseError = ref<string | null>(null);
const editExpenseAmount = ref('');
const editExpenseTitle = ref('');
const editExpenseNotes = ref('');
const editExpenseOccurredAt = ref('');

const carFees = computed(() =>
  [...feeExpenses.value]
    .sort(
      (a: ExpenseDto, b: ExpenseDto) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    )
    .map((expense: ExpenseDto) => ({
      id: expense.id,
      label: expense.title,
      dueDate: expense.occurredAt.slice(0, 10),
      value: Math.abs(Number(expense.amount) || 0),
    })),
);

/** Legacy expense rows typed as INCOME (expense summary). */
const totalIncomeFromExpenseSummary = computed(() => {
  const summaryItem = expenseSummaryItems.value.find(
    (item) => item.type === 'INCOME',
  );
  return Number(summaryItem?.totalAmount ?? 0) || 0;
});

const totalIncomeFromIncomesApi = computed(() =>
  incomeRecords.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
);

const totalIncome = computed(
  () => totalIncomeFromExpenseSummary.value + totalIncomeFromIncomesApi.value,
);

const incomeHistoryRows = computed(() =>
  [...incomeRecords.value]
    .sort(
      (a: IncomeDto, b: IncomeDto) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    )
    .map((item: IncomeDto) => ({
      id: item.id,
      date: item.occurredAt.slice(0, 10),
      title: item.title?.trim() ?? '',
      amount: item.amount,
      currency: item.currency,
      notes: item.notes?.trim() ?? '',
    })),
);

const maintenanceHistory = computed(() =>
  [...maintenanceExpenses.value]
    .sort(
      (a: ExpenseDto, b: ExpenseDto) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    )
    .map((expense: ExpenseDto) => ({
      id: expense.id,
      date: expense.occurredAt.slice(0, 10),
      title: expense.title,
      amount: Number(expense.amount) || 0,
      notes: expense.notes || '—',
    })),
);
const selectedExpense = computed(
  () =>
    [...maintenanceExpenses.value, ...feeExpenses.value].find(
      (item) => item.id === activeMaintenanceExpenseId.value,
    ) ?? null,
);

function formatExpenseDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatExpenseAmount(value: string): string {
  const amount = Number(value);
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatIncomeAmount(value: string, currency: string): string {
  const amount = Number(value);
  const code = currency?.trim() || 'PLN';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

const totalFees = computed(() => {
  const summaryItem = expenseSummaryItems.value.find(
    (item) => item.type === 'FEE',
  );
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
    if (
      item.type === 'INCOME' ||
      item.type === 'MAINTENANCE' ||
      item.type === 'FEE'
    ) {
      return sum;
    }
    return sum + (Number(item.totalAmount ?? 0) || 0);
  }, 0),
);
const totalCombinedExpenses = computed(
  () => totalFees.value + totalMaintenance.value + totalOtherExpenses.value,
);
const totalProfitLoss = computed(
  () => totalIncome.value - totalCombinedExpenses.value,
);
const isProfit = computed(() => totalProfitLoss.value >= 0);

function complianceDateFromCar(value: string | null | undefined): string {
  if (value == null || String(value).trim() === '') return '';
  return toComplianceIsoDate(String(value));
}

function toComplianceIsoDate(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return '';
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const complianceItems = computed(() => {
  const inspectionRaw = car.value?.inspectionValidUntil;
  const inspection = complianceDateFromCar(inspectionRaw ?? null);
  const policyRaw = car.value?.insuranceValidUntil;
  const policy = complianceDateFromCar(policyRaw ?? null);
  return [
    {
      title: t(
        'appSections.fleet.vehicleDetails.complianceItems.technicalInspection',
      ),
      validUntil: inspection,
      attachments: inspection
        ? (['inspection-report.pdf'] as const)
        : undefined,
      icon: 'verified' as const,
    },
    {
      title: t('appSections.fleet.vehicleDetails.complianceItems.ocAcPolicy'),
      validUntil: policy,
      attachments: policy
        ? (['policy-main.pdf', 'policy-ac-annex.pdf'] as const)
        : undefined,
      icon: 'shield' as const,
    },
  ];
});
const driverCard = computed(() => {
  if (!car.value?.driver) return { name: '', phone: '', email: '' };
  const d = car.value.driver;
  return {
    name: `${d.firstName} ${d.lastName}`.trim(),
    phone: (d.phoneNumber ?? '').trim(),
    email: (d.email ?? '').trim(),
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

const INCOMES_FETCH_LIMIT = 50;

/**
 * Loads all income pages for this vehicle so the hero total and list stay accurate.
 */
async function fetchIncomesLedger(): Promise<void> {
  let page = 1;
  const all: IncomeDto[] = [];
  while (true) {
    const response = await incomesStore.fetchIncomes({
      page,
      limit: INCOMES_FETCH_LIMIT,
      carId: carId.value,
    });
    all.push(...response.data);
    if (!response.meta.hasNextPage) break;
    page += 1;
  }
  incomeRecords.value = all.sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

useSeoMeta({
  title: computed(
    () => `${t('appSections.fleet.vehicleDetailsTitle')} #${carId.value}`,
  ),
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
      fetchIncomesLedger(),
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
  void driversStore
    .getDriverSuggestions(10)
    .then((items) => {
      assignSuggestions.value = items;
    })
    .finally(() => {
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

function handleOpenAddIncomeDialog() {
  addIncomeDialog.value?.showModal();
}

function resetEditExpenseState() {
  maintenanceFormError.value = null;
  activeMaintenanceExpenseId.value = null;
  editExpenseAmount.value = '';
  editExpenseTitle.value = '';
  editExpenseNotes.value = '';
  editExpenseOccurredAt.value = '';
}

function openEditExpenseDialog(expenseId: string) {
  const expense = [...maintenanceExpenses.value, ...feeExpenses.value].find(
    (item) => item.id === expenseId,
  );
  if (!expense) return;
  activeMaintenanceExpenseId.value = expense.id;
  maintenanceFormError.value = null;
  editExpenseTitle.value = expense.title;
  editExpenseAmount.value = String(Number(expense.amount) || 0);
  editExpenseNotes.value = expense.notes ?? '';
  editExpenseOccurredAt.value = expense.occurredAt.slice(0, 10);
  editExpenseDialog.value?.showModal();
}

function openDeleteExpenseDialog(expenseId: string) {
  activeMaintenanceExpenseId.value = expenseId;
  deleteExpenseError.value = null;
  deleteExpenseDialog.value?.showModal();
}

function closeDeleteExpenseDialog() {
  deleteExpenseError.value = null;
  activeMaintenanceExpenseId.value = null;
}

async function handleSaveExpenseEdit() {
  if (!activeMaintenanceExpenseId.value) return;
  if (
    !editExpenseTitle.value.trim() ||
    !editExpenseAmount.value.trim() ||
    !editExpenseOccurredAt.value.trim()
  ) {
    maintenanceFormError.value = t(
      'appSections.fleet.vehicleDetails.expenseDialog.validation',
    );
    return;
  }

  maintenanceFormError.value = null;
  try {
    await expensesStore.updateExpense(activeMaintenanceExpenseId.value, {
      type: selectedExpense.value?.type ?? 'MAINTENANCE',
      amount: editExpenseAmount.value.trim(),
      currency: 'PLN',
      occurredAt: new Date(
        `${editExpenseOccurredAt.value.trim()}T12:00:00.000Z`,
      ).toISOString(),
      title: editExpenseTitle.value.trim(),
      notes: editExpenseNotes.value.trim() || undefined,
      carPaymentKind: selectedExpense.value?.carPaymentKind || undefined,
      carId: selectedExpense.value?.carId || carId.value || undefined,
      driverId: selectedExpense.value?.driverId || undefined,
    });
    await handleExpenseCreated();
    editExpenseDialog.value?.close();
    resetEditExpenseState();
  } catch {
    maintenanceFormError.value = t(
      'appSections.fleet.vehicleDetails.expenseDialog.error',
    );
  }
}

async function handleConfirmDeleteExpense() {
  if (!activeMaintenanceExpenseId.value) return;
  deleteExpenseError.value = null;
  try {
    await expensesStore.deleteExpense(activeMaintenanceExpenseId.value);
    await handleExpenseCreated();
    deleteExpenseDialog.value?.close();
  } catch {
    deleteExpenseError.value = t(
      'appSections.fleet.vehicleDetails.expenseDeleteError',
    );
  }
}

async function handleExpenseCreated() {
  await Promise.all([
    fetchFees(1),
    fetchMaintenance(1),
    fetchExpensesSummary(),
  ]);
}

async function handleIncomeCreated() {
  await Promise.all([fetchIncomesLedger(), fetchExpensesSummary()]);
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

function handleComplianceEmptyCta() {
  document.getElementById('fleet-vehicle-hero')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}
</script>

<template>
  <section class="fleet-vehicle-page">
    <template v-if="detailsLoading && !detailsResolved">
      <div class="fleet-vehicle-page__hero fleet-vehicle-page__hero--split">
        <div class="fleet-skeleton fleet-skeleton--header" />
        <div class="fleet-skeleton fleet-skeleton--bento" />
      </div>
      <div class="fleet-vehicle-page__grid">
        <div class="fleet-vehicle-page__grid-main">
          <div class="fleet-skeleton fleet-skeleton--income" />
          <div class="fleet-skeleton fleet-skeleton--ledger-tabs" />
          <div class="fleet-skeleton fleet-skeleton--card-lg" />
        </div>
        <div class="fleet-vehicle-page__grid-aside">
          <div class="fleet-skeleton fleet-skeleton--card-md" />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="fleet-vehicle-page__hero fleet-vehicle-page__hero--split">
        <FleetVehicleHeader
          id="fleet-vehicle-hero"
          class="fleet-vehicle-page__hero-header"
          :overline="t('appSections.fleet.vehicleDetails.commandView')"
          :car-name="carName"
          :plate-label="t('appSections.fleet.table.plate')"
          :registration-number="registrationNumber"
          :vin-label="t('appSections.fleet.table.vin')"
          :vin="vin"
          :edit-vehicle-label="
            t('appSections.fleet.vehicleDetails.editVehicle')
          "
          :add-expense-label="t('appSections.fleet.vehicleDetails.addExpense')"
          :add-income-label="t('appSections.fleet.vehicleDetails.addIncome')"
          :save-label="t('appSections.fleet.vehicleDetails.save')"
          :saving-label="t('common.loading')"
          :cancel-label="t('appSections.fleet.vehicleDetails.cancel')"
          :is-saving="carsStore.updating"
          @update-info="handleUpdateVehicleInfo"
          @add-expense="handleOpenAddExpenseDialog"
          @add-income="handleOpenAddIncomeDialog"
        />
        <FleetFinancialSummaryCard
          class="fleet-vehicle-page__hero-bento"
          :total-income="totalIncome"
          :total-fees="totalFees"
          :total-maintenance="totalMaintenance"
          :total-other-expenses="totalOtherExpenses"
          :total-combined-expenses="totalCombinedExpenses"
          :total-profit-loss="totalProfitLoss"
          :is-profit="isProfit"
        />
      </div>

      <div class="fleet-vehicle-page__grid">
        <div class="fleet-vehicle-page__grid-main">
          <section
            class="fleet-vehicle-page__income"
            aria-labelledby="fleet-income-heading"
          >
            <h2
              id="fleet-income-heading"
              class="fleet-vehicle-page__income-title"
            >
              {{ t('appSections.fleet.vehicleDetails.incomeHistoryTitle') }}
            </h2>
            <ul
              v-if="incomeHistoryRows.length > 0"
              class="fleet-vehicle-page__income-list"
              :aria-label="
                t('appSections.fleet.vehicleDetails.incomeHistoryTitle')
              "
            >
              <li
                v-for="row in incomeHistoryRows"
                :key="row.id"
                class="fleet-vehicle-page__income-row"
              >
                <div class="fleet-vehicle-page__income-row-main">
                  <span class="fleet-vehicle-page__income-row-title">{{
                    row.title ||
                    t('appSections.fleet.vehicleDetails.incomeDefaultTitle')
                  }}</span>
                  <span class="fleet-vehicle-page__income-row-amount">{{
                    formatIncomeAmount(row.amount, row.currency)
                  }}</span>
                </div>
                <p class="fleet-vehicle-page__income-row-meta">
                  {{ formatExpenseDate(row.date) }}
                  <template v-if="row.notes">
                    <span class="fleet-vehicle-page__income-row-notes">
                      · {{ row.notes }}
                    </span>
                  </template>
                </p>
              </li>
            </ul>
            <ListEmptyState
              v-else
              icon="account_balance_wallet"
              :title="t('appSections.fleet.vehicleDetails.emptyIncomeTitle')"
              :description="
                t('appSections.fleet.vehicleDetails.emptyIncomeCopy')
              "
            />
          </section>
          <div class="fleet-vehicle-page__ledger">
            <div
              class="fleet-vehicle-page__ledger-tabs"
              role="tablist"
              :aria-label="
                t('appSections.fleet.vehicleDetails.ledgerTablistAria')
              "
            >
              <button
                id="fleet-ledger-tab-fees"
                type="button"
                class="fleet-vehicle-page__ledger-tab"
                :class="{
                  'fleet-vehicle-page__ledger-tab--active':
                    vehicleLedgerTab === 'fees',
                }"
                role="tab"
                :aria-selected="vehicleLedgerTab === 'fees'"
                :tabindex="vehicleLedgerTab === 'fees' ? 0 : -1"
                @click="vehicleLedgerTab = 'fees'"
              >
                {{ t('appSections.fleet.vehicleDetails.carFeesTitle') }}
              </button>
              <button
                id="fleet-ledger-tab-maintenance"
                type="button"
                class="fleet-vehicle-page__ledger-tab"
                :class="{
                  'fleet-vehicle-page__ledger-tab--active':
                    vehicleLedgerTab === 'maintenance',
                }"
                role="tab"
                :aria-selected="vehicleLedgerTab === 'maintenance'"
                :tabindex="vehicleLedgerTab === 'maintenance' ? 0 : -1"
                @click="vehicleLedgerTab = 'maintenance'"
              >
                {{ t('appSections.fleet.vehicleDetails.maintenanceHistory') }}
              </button>
            </div>
            <div
              v-show="vehicleLedgerTab === 'fees'"
              class="fleet-vehicle-page__ledger-panel"
              role="tabpanel"
              aria-labelledby="fleet-ledger-tab-fees"
            >
              <FleetFeesCard
                hide-heading
                :items="carFees"
                @edit="openEditExpenseDialog"
                @delete="openDeleteExpenseDialog"
              >
                <template #footer>
                  <button
                    v-if="feesHasMore"
                    type="button"
                    class="fleet-load-more-btn"
                    :disabled="feesLoadingMore"
                    @click="handleLoadMoreFees"
                  >
                    {{
                      feesLoadingMore
                        ? t('common.loading')
                        : t('appSections.fleet.vehicleDetails.loadMore')
                    }}
                  </button>
                </template>
              </FleetFeesCard>
            </div>
            <div
              v-show="vehicleLedgerTab === 'maintenance'"
              class="fleet-vehicle-page__ledger-panel"
              role="tabpanel"
              aria-labelledby="fleet-ledger-tab-maintenance"
            >
              <FleetMaintenanceTimeline
                hide-heading
                :items="maintenanceHistory"
                @edit="openEditExpenseDialog"
                @delete="openDeleteExpenseDialog"
              >
                <template #footer>
                  <button
                    v-if="maintenanceHasMore"
                    type="button"
                    class="fleet-load-more-btn"
                    :disabled="maintenanceLoadingMore"
                    @click="handleLoadMoreMaintenance"
                  >
                    {{
                      maintenanceLoadingMore
                        ? t('common.loading')
                        : t('appSections.fleet.vehicleDetails.loadMore')
                    }}
                  </button>
                </template>
              </FleetMaintenanceTimeline>
            </div>
          </div>
        </div>
        <aside class="fleet-vehicle-page__grid-aside">
          <FleetComplianceCard
            :compliance-items="complianceItems"
            :driver="driverCard"
            @assign-other="handleAssignOther"
            @remove-driver="handleRemoveDriver"
            @compliance-empty-cta="handleComplianceEmptyCta"
          />
        </aside>
      </div>

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
              <span
                class="material-symbols-outlined fleet-assign-dialog__search-icon"
                aria-hidden="true"
                >search</span
              >
              <input
                :value="assignSearchInput"
                class="ti-input fleet-assign-dialog__search-input"
                type="text"
                :placeholder="t('appSections.drivers.searchPlaceholder')"
                @input="onAssignSearchInput"
              >
            </label>

            <div class="fleet-assign-dialog__list">
              <p v-if="assignSearching" class="fleet-assign-dialog__state">
                {{ t('common.loading') }}
              </p>
              <p
                v-else-if="assignSuggestions.length === 0"
                class="fleet-assign-dialog__state"
              >
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
                  {{
                    driver.email ||
                    driver.phoneNumber ||
                    t('appSections.drivers.details.common.emptyValue')
                  }}
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
      <AddIncomeDialog
        ref="addIncomeDialog"
        :initial-car-id="carId"
        :initial-driver-id="car?.driver?.id ?? ''"
        @created="handleIncomeCreated"
      />
      <EntityDialogShell
        ref="editExpenseDialog"
        title-id="fleet-edit-expense-dialog-title"
        :title="t('appSections.fleet.vehicleDetails.editExpenseTitle')"
        :lead="t('appSections.fleet.vehicleDetails.editExpenseLead')"
        width="min(34rem, calc(100vw - 2rem))"
        @close="resetEditExpenseState"
      >
        <template #body>
          <form
            id="fleet-edit-expense-form"
            class="fleet-expense-dialog__form"
            @submit.prevent="handleSaveExpenseEdit"
          >
            <label class="fleet-expense-dialog__field">
              <span>{{
                `${t('appSections.fleet.vehicleDetails.expenseDialog.titleField')} *`
              }}</span>
              <input
                v-model="editExpenseTitle"
                class="ti-input"
                type="text"
                :placeholder="
                  t(
                    'appSections.fleet.vehicleDetails.expenseDialog.titlePlaceholder',
                  )
                "
                required
              >
            </label>
            <label class="fleet-expense-dialog__field">
              <span>{{
                `${t('appSections.fleet.vehicleDetails.expenseDialog.amount')} *`
              }}</span>
              <input
                v-model="editExpenseAmount"
                class="ti-input"
                type="text"
                inputmode="decimal"
                placeholder="1499.99"
                required
              >
            </label>
            <div class="fleet-expense-dialog__field">
              <span>{{
                `${t('appSections.fleet.vehicleDetails.expenseDialog.occurredAt')} *`
              }}</span>
              <FleetDateInput
                v-model="editExpenseOccurredAt"
                input-id="fleet-edit-expense-occurred-at"
                :title="
                  t('appSections.fleet.vehicleDetails.expenseDialog.occurredAt')
                "
              />
            </div>
            <label
              class="fleet-expense-dialog__field fleet-expense-dialog__field--full"
            >
              <span>{{
                t('appSections.fleet.vehicleDetails.expenseDialog.notes')
              }}</span>
              <textarea
                v-model="editExpenseNotes"
                class="ti-input fleet-expense-dialog__textarea"
                rows="3"
                :placeholder="
                  t(
                    'appSections.fleet.vehicleDetails.expenseDialog.notesPlaceholder',
                  )
                "
              />
            </label>
          </form>
        </template>
        <template #footer>
          <div class="fleet-expense-dialog__footer">
            <p
              v-if="maintenanceFormError"
              class="fleet-expense-dialog__error"
              role="alert"
            >
              {{ maintenanceFormError }}
            </p>
            <button
              type="button"
              class="fleet-expense-dialog__btn fleet-expense-dialog__btn--ghost"
              :disabled="expensesStore.updating"
              @click="editExpenseDialog?.close()"
            >
              {{ t('appSections.fleet.vehicleDetails.cancel') }}
            </button>
            <button
              form="fleet-edit-expense-form"
              type="submit"
              class="fleet-expense-dialog__btn fleet-expense-dialog__btn--primary"
              :disabled="expensesStore.updating"
            >
              {{
                expensesStore.updating
                  ? t('common.loading')
                  : t('appSections.fleet.vehicleDetails.save')
              }}
            </button>
          </div>
        </template>
      </EntityDialogShell>
      <EntityDialogShell
        ref="deleteExpenseDialog"
        title-id="fleet-delete-expense-dialog-title"
        :title="t('appSections.fleet.vehicleDetails.deleteExpenseTitle')"
        :lead="t('appSections.fleet.vehicleDetails.deleteExpenseConfirm')"
        width="min(30rem, calc(100vw - 2rem))"
        @close="closeDeleteExpenseDialog"
      >
        <template #body>
          <div class="fleet-delete-expense">
            <p class="fleet-delete-expense__body">
              {{ t('appSections.fleet.vehicleDetails.deleteExpenseConfirm') }}
            </p>
            <dl v-if="selectedExpense" class="fleet-delete-expense__details">
              <div class="fleet-delete-expense__row">
                <dt>
                  {{
                    t(
                      'appSections.fleet.vehicleDetails.expenseDialog.titleField',
                    )
                  }}
                </dt>
                <dd>{{ selectedExpense.title }}</dd>
              </div>
              <div class="fleet-delete-expense__row">
                <dt>
                  {{
                    t('appSections.fleet.vehicleDetails.expenseDialog.amount')
                  }}
                </dt>
                <dd>{{ formatExpenseAmount(selectedExpense.amount) }}</dd>
              </div>
              <div class="fleet-delete-expense__row">
                <dt>
                  {{
                    t(
                      'appSections.fleet.vehicleDetails.expenseDialog.occurredAt',
                    )
                  }}
                </dt>
                <dd>{{ formatExpenseDate(selectedExpense.occurredAt) }}</dd>
              </div>
              <div class="fleet-delete-expense__row">
                <dt>
                  {{ t('appSections.fleet.vehicleDetails.expenseDialog.type') }}
                </dt>
                <dd>
                  {{
                    t(
                      `appSections.fleet.vehicleDetails.expenseDialog.expenseTypes.${selectedExpense.type}`,
                    )
                  }}
                </dd>
              </div>
              <div
                class="fleet-delete-expense__row fleet-delete-expense__row--full"
              >
                <dt>
                  {{
                    t('appSections.fleet.vehicleDetails.expenseDialog.notes')
                  }}
                </dt>
                <dd>{{ selectedExpense.notes || '—' }}</dd>
              </div>
            </dl>
          </div>
        </template>
        <template #footer>
          <div class="fleet-expense-dialog__footer">
            <p
              v-if="deleteExpenseError"
              class="fleet-expense-dialog__error"
              role="alert"
            >
              {{ deleteExpenseError }}
            </p>
            <button
              type="button"
              class="fleet-expense-dialog__btn fleet-expense-dialog__btn--ghost"
              :disabled="expensesStore.deleting"
              @click="deleteExpenseDialog?.close()"
            >
              {{ t('appSections.fleet.vehicleDetails.cancel') }}
            </button>
            <button
              type="button"
              class="fleet-expense-dialog__btn fleet-expense-dialog__btn--danger"
              :disabled="expensesStore.deleting"
              @click="handleConfirmDeleteExpense"
            >
              {{
                expensesStore.deleting
                  ? t('common.loading')
                  : t('appSections.fleet.vehicleDetails.deleteExpense')
              }}
            </button>
          </div>
        </template>
      </EntityDialogShell>
    </template>
  </section>
</template>

<style scoped>
.fleet-vehicle-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.fleet-vehicle-page__hero {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1.5rem;
}

.fleet-vehicle-page__hero-header {
  min-width: 0;
  height: 100%;
}

.fleet-vehicle-page__hero-bento {
  min-width: 0;
  width: 100%;
  height: 100%;
}

.fleet-vehicle-page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.5rem;
}

.fleet-vehicle-page__grid-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.fleet-vehicle-page__income {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
}

.fleet-vehicle-page__income-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--color-on-surface);
}

.fleet-vehicle-page__income-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.fleet-vehicle-page__income-row {
  margin: 0;
  border-radius: 0.75rem;
  padding: 0.75rem 0.85rem;
  background: var(--color-surface-container-lowest);
  box-shadow: var(--shadow-ambient);
}

.fleet-vehicle-page__income-row-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.fleet-vehicle-page__income-row-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-on-surface);
  min-width: 0;
}

.fleet-vehicle-page__income-row-amount {
  flex-shrink: 0;
  font-size: 0.875rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--color-secondary);
}

.fleet-vehicle-page__income-row-meta {
  margin: 0.35rem 0 0;
  font-size: 0.75rem;
  color: var(--color-on-surface-variant);
}

.fleet-vehicle-page__income-row-notes {
  font-weight: 500;
}

.fleet-vehicle-page__grid-aside {
  min-width: 0;
}

.fleet-vehicle-page__ledger {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.fleet-vehicle-page__ledger-tabs {
  display: flex;
  width: 100%;
  max-width: 100%;
  flex-wrap: nowrap;
  gap: 0.2rem;
  padding: 0.22rem;
  margin-bottom: 1rem;
  border-radius: 0.75rem;
  background: var(--color-surface-container-high);
  box-sizing: border-box;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.fleet-vehicle-page__ledger-tab {
  flex: 1;
  min-width: 0;
  border: none;
  border-radius: 0.55rem;
  padding: 0.48rem 0.65rem;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.25;
  cursor: pointer;
  color: var(--color-on-surface-variant);
  background: transparent;
  transition:
    background-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.fleet-vehicle-page__ledger-tab:hover:not(
    .fleet-vehicle-page__ledger-tab--active
  ) {
  background: color-mix(
    in srgb,
    var(--color-surface-container-lowest) 55%,
    transparent
  );
  color: var(--color-on-surface);
}

.fleet-vehicle-page__ledger-tab--active {
  background: var(--color-surface-container-lowest);
  color: var(--color-on-surface);
  font-weight: 700;
  box-shadow:
    0 1px 2px color-mix(in srgb, var(--color-on-surface) 5%, transparent),
    0 4px 12px color-mix(in srgb, var(--color-on-surface) 4%, transparent);
}

.fleet-vehicle-page__ledger-tab--active:hover {
  background: var(--color-surface-container-lowest);
}

.fleet-vehicle-page__ledger-tab:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 45%, transparent);
  outline-offset: 2px;
}

.fleet-vehicle-page__ledger-panel {
  min-width: 0;
}

@media (min-width: 768px) {
  .fleet-vehicle-page__hero--split {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 1.5rem;
    align-items: stretch;
  }

  .fleet-vehicle-page__hero--split .fleet-vehicle-page__hero-header {
    grid-column: span 8;
  }

  .fleet-vehicle-page__hero--split .fleet-vehicle-page__hero-bento {
    grid-column: span 4;
  }

  .fleet-vehicle-page__hero--split .fleet-skeleton--header {
    grid-column: span 8;
    min-width: 0;
    height: 100%;
    min-height: 8.2rem;
  }

  .fleet-vehicle-page__hero--split .fleet-skeleton--bento {
    grid-column: span 4;
    min-width: 0;
    width: 100%;
    height: 100%;
    min-height: 8.2rem;
  }

  .fleet-vehicle-page__grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }

  .fleet-vehicle-page__grid-main {
    grid-column: span 8;
  }

  .fleet-vehicle-page__grid-aside {
    grid-column: span 4;
  }
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
  width: 100%;
}

.fleet-skeleton--bento {
  min-height: 11rem;
  width: 100%;
}

.fleet-skeleton--card-lg {
  min-height: 18rem;
}

.fleet-skeleton--card-md {
  min-height: 12rem;
}

.fleet-skeleton--income {
  min-height: 13rem;
  border-radius: 1rem;
}

.fleet-skeleton--ledger-tabs {
  min-height: 2.5rem;
  max-width: 20rem;
  border-radius: 0.75rem;
}

@keyframes fleet-skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
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

.fleet-load-more-btn {
  align-self: center;
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

.fleet-expense-dialog__form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.fleet-expense-dialog__field {
  min-width: 0;
}

.fleet-expense-dialog__field > span {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.fleet-expense-dialog__field--full {
  grid-column: 1 / -1;
}

.fleet-expense-dialog__textarea {
  resize: vertical;
  min-height: 5rem;
}

.fleet-expense-dialog__footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.55rem;
}

.fleet-expense-dialog__error {
  margin: 0;
  margin-right: auto;
  align-self: center;
  font-size: 0.8125rem;
  color: var(--color-error);
}

.fleet-expense-dialog__btn {
  border: none;
  border-radius: 0.7rem;
  padding: 0.56rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.fleet-expense-dialog__btn--ghost {
  color: var(--color-on-surface);
  background: transparent;
}

.fleet-expense-dialog__btn--ghost:hover:not(:disabled) {
  background: var(--color-surface-container-high);
}

.fleet-expense-dialog__btn--primary {
  color: var(--color-on-secondary);
  background: var(--color-secondary);
}

.fleet-expense-dialog__btn--primary:hover:not(:disabled) {
  filter: brightness(1.06);
}

.fleet-expense-dialog__btn--danger {
  color: color-mix(in srgb, var(--color-error) 90%, white);
  background: color-mix(in srgb, var(--color-error) 14%, transparent);
}

.fleet-delete-expense__body {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
}

.fleet-delete-expense {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.fleet-delete-expense__details {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
}

.fleet-delete-expense__row {
  border-radius: 0.7rem;
  background: var(--color-surface-container-lowest);
  padding: 0.6rem 0.7rem;
}

.fleet-delete-expense__row--full {
  grid-column: 1 / -1;
}

.fleet-delete-expense__row dt {
  margin: 0;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.fleet-delete-expense__row dd {
  margin: 0.3rem 0 0;
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--color-on-surface);
}
</style>
