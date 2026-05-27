<script setup lang="ts">
import type { ExpenseDto } from '#shared/dto/expense.dto';
import type { IncomeDto } from '#shared/dto/income.dto';
import FinanceCategoryDonutChart from '~/components/finance/charts/FinanceCategoryDonutChart.vue';
import FinanceCumulativeProfitChart from '~/components/finance/charts/FinanceCumulativeProfitChart.vue';
import FinanceSpendTrendChart from '~/components/finance/charts/FinanceSpendTrendChart.vue';
import FinanceTopCarsChart from '~/components/finance/charts/FinanceTopCarsChart.vue';
import FinanceFilters from '~/components/finance/FinanceFilters.vue';
import FinanceKpiCard from '~/components/finance/FinanceKpiCard.vue';
import ListEmptyState from '~/components/shared/ListEmptyState.vue';

const { t } = useI18n();
const financesStore = useFinancesStore();
const expensesStore = useExpensesStore();
const incomesStore = useIncomesStore();

useSeoMeta({
  title: computed(() => t('appSections.finance.title')),
  description: computed(() => t('appSections.finance.lead')),
});

const RECENT_PAGE = 1;
const RECENT_LIMIT = 10;

const period = ref('currentMonth');
const applyingPreset = ref(false);

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toIsoDate(d);
}

function parseDayBoundary(value: string, endOfDay = false): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return new Date(`${value}T${endOfDay ? '23:59:59' : '00:00:00'}`);
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

const dateFrom = ref(daysAgoIso(90));
const dateTo = ref(toIsoDate(new Date()));

const recentExpenses = ref<ExpenseDto[]>([]);
const recentIncomes = ref<IncomeDto[]>([]);
const recentExpensesLoading = ref(true);
const recentIncomesLoading = ref(true);

watch(period, (value) => {
  if (value === 'customRange') return;
  applyingPreset.value = true;
  const now = new Date();
  if (value === 'currentWeek') {
    dateFrom.value = toIsoDate(startOfWeek(now));
    dateTo.value = toIsoDate(now);
    nextTick(() => {
      applyingPreset.value = false;
    });
    return;
  }
  if (value === 'currentMonth') {
    dateFrom.value = toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
    dateTo.value = toIsoDate(now);
    nextTick(() => {
      applyingPreset.value = false;
    });
    return;
  }
  if (value === 'currentYear') {
    dateFrom.value = toIsoDate(new Date(now.getFullYear(), 0, 1));
    dateTo.value = toIsoDate(now);
    nextTick(() => {
      applyingPreset.value = false;
    });
  }
}, { immediate: true });

watch([dateFrom, dateTo], () => {
  if (applyingPreset.value) return;
  if (period.value !== 'customRange') {
    period.value = 'customRange';
  }
});

function money(value: number, c = 'PLN'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: c,
    maximumFractionDigits: 0,
  }).format(value);
}

function byOccurredAtDesc<T extends { occurredAt: string }>(a: T, b: T): number {
  return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
}

async function loadRecentExpenses(): Promise<void> {
  recentExpensesLoading.value = true;
  try {
    const expRes = await expensesStore.fetchExpenses({
      page: RECENT_PAGE,
      limit: RECENT_LIMIT,
    });
    recentExpenses.value = [...(expRes.data ?? [])].sort(byOccurredAtDesc);
  } catch {
    recentExpenses.value = [];
  } finally {
    recentExpensesLoading.value = false;
  }
}

async function loadRecentIncomes(): Promise<void> {
  recentIncomesLoading.value = true;
  try {
    const incRes = await incomesStore.fetchIncomes({
      page: RECENT_PAGE,
      limit: RECENT_LIMIT,
    });
    recentIncomes.value = [...(incRes.data ?? [])].sort(byOccurredAtDesc);
  } catch {
    recentIncomes.value = [];
  } finally {
    recentIncomesLoading.value = false;
  }
}

async function loadRecentLists(): Promise<void> {
  await Promise.all([loadRecentExpenses(), loadRecentIncomes()]);
}

watch([dateFrom, dateTo], () => {
  void financesStore.fetchDashboard(dateFrom.value, dateTo.value);
}, { immediate: true });

onMounted(() => {
  void loadRecentLists();
});

const summary = computed(() => financesStore.summary);

const totalSpend = computed(() => summary.value?.totalSpend ?? 0);
const avgDailySpend = computed(() => summary.value?.avgDailySpend ?? 0);
const totalRevenue = computed(() => summary.value?.totalRevenue ?? 0);
const avgDailyRevenue = computed(() => summary.value?.avgDailyRevenue ?? 0);
const totalProfitLoss = computed(() => summary.value?.totalProfitLoss ?? 0);
const avgDailyProfitLoss = computed(() => summary.value?.avgDailyProfitLoss ?? 0);

/** Trend API returned no daily points (not the same as values being zero). */
const showSpendTrendEmpty = computed(
  () => !financesStore.loading && financesStore.trend.length === 0,
);

/** Expense-structure API returned no category rows for the range. */
const showCategoryMixEmpty = computed(
  () => !financesStore.loading && financesStore.expenseStructure.length === 0,
);

/** True when API sent nothing usable (empty, all zeros, or blank plates only). */
function hasMeaningfulTopCarEntries(
  entries: { plateNumber: string; value: number }[] | null | undefined,
): boolean {
  if (entries == null || entries.length === 0) return false;
  return entries.some(
    (e) =>
      String(e.plateNumber ?? '').trim().length > 0 &&
      Number.isFinite(Number(e.value)) &&
      Number(e.value) !== 0,
  );
}

/** No usable per-vehicle expense totals for the range (empty or all zero). */
const showTopCarsExpensesEmpty = computed(
  () =>
    !financesStore.loading &&
    !hasMeaningfulTopCarEntries(financesStore.carsRatings?.expenses),
);

/** No usable per-vehicle revenue totals for the range (empty or all zero). */
const showTopCarsRevenueEmpty = computed(
  () =>
    !financesStore.loading &&
    !hasMeaningfulTopCarEntries(financesStore.carsRatings?.earnings),
);

const spendTrend = computed(() => {
  const byDay = new Map(
    financesStore.trend.map((p) => [p.date.slice(0, 10), p]),
  );

  const from = parseDayBoundary(dateFrom.value) ?? new Date();
  const to = parseDayBoundary(dateTo.value) ?? new Date();
  const labels: string[] = [];
  const keys: string[] = [];
  const cursor = new Date(from);

  while (cursor <= to) {
    const key = toIsoDate(cursor);
    keys.push(key);
    labels.push(key.slice(5));
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    labels,
    spendValues: keys.map((key) =>
      Number((-(byDay.get(key)?.spendValue ?? 0)).toFixed(2)),
    ),
    revenueValues: keys.map((key) =>
      Number((byDay.get(key)?.revenueValue ?? 0).toFixed(2)),
    ),
    profitLossValues: keys.map((key) =>
      Number((byDay.get(key)?.profitLossValue ?? 0).toFixed(2)),
    ),
  };
});

const categoryDonutRows = computed(() =>
  financesStore.expenseStructure.map((row) => ({
    name: t(`appSections.finance.types.${row.category}`),
    value: Number(row.percentage.toFixed(2)),
  })),
);

const cumulativeProfit = computed(() => {
  const pts = financesStore.cumulativeResult;
  return {
    labels: pts.map((p) => p.date),
    actualValues: pts.map((p) => p.actualValue),
    projectedValues: pts.map((p) => p.projectedValue),
  };
});

function topCarChartEntries(
  entries: { plateNumber: string; value: number }[],
  max = 7,
) {
  const sorted = [...entries].sort((a, b) => b.value - a.value).slice(0, max);
  return {
    labels: sorted.map((e) => e.plateNumber),
    values: sorted.map((e) => Number(e.value.toFixed(2))),
  };
}

const topCars = computed(() => {
  const list = financesStore.carsRatings?.expenses ?? [];
  return topCarChartEntries(list);
});

const topCarsRevenue = computed(() => {
  const list = financesStore.carsRatings?.earnings ?? [];
  return topCarChartEntries(list);
});

function incomeAmount(row: IncomeDto): number {
  return Number.parseFloat(row.amount) || 0;
}

const showRecentExpensesEmpty = computed(
  () => !recentExpensesLoading.value && recentExpenses.value.length === 0,
);

const showRecentIncomesEmpty = computed(
  () => !recentIncomesLoading.value && recentIncomes.value.length === 0,
);
</script>

<template>
  <div class="finance-page app-page app-page--wide" :class="{ 'finance-page--loading': financesStore.loading }">
    <AppPageHeader
      :title="t('appSections.finance.title')"
      :lead="t('appSections.finance.lead')"
    />

    <FinanceFilters
      :period="period"
      :date-from="dateFrom"
      :date-to="dateTo"
      @update:period="period = $event"
      @update:date-from="dateFrom = $event"
      @update:date-to="dateTo = $event"
    />

    <AppSection id="finance-kpis">
      <div class="app-kpi-row app-kpi-row--4">
        <FinanceKpiCard :label="t('appSections.finance.kpis.totalSpend')" :value="money(totalSpend)" tone="warn" />
        <FinanceKpiCard :label="t('appSections.finance.kpis.avgDaily')" :value="money(avgDailySpend)" />
        <FinanceKpiCard :label="t('appSections.finance.kpis.totalRevenue')" :value="money(totalRevenue)" tone="good" />
        <FinanceKpiCard :label="t('appSections.finance.kpis.avgRevenueDaily')" :value="money(avgDailyRevenue)" tone="good" />
      </div>
      <div class="app-kpi-row app-kpi-row--2">
        <FinanceKpiCard
          :label="t('appSections.finance.kpis.profitLoss')"
          :value="money(totalProfitLoss)"
          :tone="totalProfitLoss >= 0 ? 'good' : 'warn'"
        />
        <FinanceKpiCard
          :label="t('appSections.finance.kpis.avgProfitLossDaily')"
          :value="money(avgDailyProfitLoss)"
          :tone="avgDailyProfitLoss >= 0 ? 'good' : 'warn'"
        />
      </div>
    </AppSection>

    <AppSection id="finance-charts">
    <div class="app-panel-grid">
      <article class="app-panel app-panel--raised app-panel-grid__wide">
        <h3 class="app-panel__title">{{ t('appSections.finance.charts.spendTrend') }}</h3>
        <ListEmptyState
          v-if="showSpendTrendEmpty"
          icon="show_chart"
          :title="t('appSections.finance.charts.spendTrendEmptyTitle')"
          :description="t('appSections.finance.charts.spendTrendEmptyDescription')"
        />
        <FinanceSpendTrendChart
          v-else
          :labels="spendTrend.labels"
          :spend-values="spendTrend.spendValues"
          :revenue-values="spendTrend.revenueValues"
          :profit-loss-values="spendTrend.profitLossValues"
        />
      </article>

      <article class="app-panel app-panel--raised">
        <h3 class="app-panel__title">{{ t('appSections.finance.charts.categoryMix') }}</h3>
        <ListEmptyState
          v-if="showCategoryMixEmpty"
          icon="pie_chart"
          :title="t('appSections.finance.charts.categoryMixEmptyTitle')"
          :description="t('appSections.finance.charts.categoryMixEmptyDescription')"
        />
        <FinanceCategoryDonutChart v-else :rows="categoryDonutRows" />
      </article>

      <article class="app-panel app-panel--raised">
        <h3 class="app-panel__title">{{ t('appSections.finance.charts.typeBreakdown') }}</h3>
        <FinanceCumulativeProfitChart
          :labels="cumulativeProfit.labels"
          :actual-values="cumulativeProfit.actualValues"
          :projected-values="cumulativeProfit.projectedValues"
        />
      </article>

      <article class="app-panel app-panel--raised">
        <h3 class="app-panel__title">{{ t('appSections.finance.charts.intensity') }}</h3>
        <ListEmptyState
          v-if="showTopCarsExpensesEmpty"
          icon="directions_car"
          :title="t('appSections.finance.charts.intensityEmptyTitle')"
          :description="t('appSections.finance.charts.intensityEmptyDescription')"
        />
        <FinanceTopCarsChart
          v-else
          :labels="topCars.labels"
          :values="topCars.values"
          color="#ba1a1a"
        />
      </article>

      <article class="app-panel app-panel--raised">
        <h3 class="app-panel__title">{{ t('appSections.finance.charts.recurring') }}</h3>
        <ListEmptyState
          v-if="showTopCarsRevenueEmpty"
          icon="payments"
          :title="t('appSections.finance.charts.recurringEmptyTitle')"
          :description="t('appSections.finance.charts.recurringEmptyDescription')"
        />
        <FinanceTopCarsChart
          v-else
          :labels="topCarsRevenue.labels"
          :values="topCarsRevenue.values"
          color="#0f8a46"
        />
      </article>
    </div>
    </AppSection>

    <AppSection :title="t('appSections.finance.recent.title')" id="finance-recent">
    <div class="app-panel-grid">
      <section class="app-panel app-panel--raised">
        <h3 class="app-panel__title">{{ t('appSections.finance.recent.title') }}</h3>
        <ListEmptyState
          v-if="showRecentExpensesEmpty"
          icon="receipt_long"
          :title="t('appSections.finance.recent.emptyTitle')"
          :description="t('appSections.finance.recent.emptyDescription')"
        />
        <div v-else class="finance-page__table">
          <div class="finance-page__table-head">
            <span>{{ t('appSections.finance.recent.date') }}</span>
            <span>{{ t('appSections.finance.recent.type') }}</span>
            <span>{{ t('appSections.finance.recent.titleCol') }}</span>
            <span>{{ t('appSections.finance.recent.amount') }}</span>
          </div>
          <div v-for="row in recentExpenses" :key="row.id" class="finance-page__table-row">
            <span>{{ row.occurredAt.slice(0, 10) }}</span>
            <span>{{ t(`appSections.finance.types.${row.type}`) }}</span>
            <span>{{ row.title }}</span>
            <strong>{{ money(Number(row.amount), row.currency) }}</strong>
          </div>
        </div>
      </section>

      <section class="app-panel app-panel--raised">
        <h3 class="app-panel__title">{{ t('appSections.finance.recentEarnings.title') }}</h3>
        <ListEmptyState
          v-if="showRecentIncomesEmpty"
          icon="account_balance_wallet"
          :title="t('appSections.finance.recentEarnings.emptyTitle')"
          :description="t('appSections.finance.recentEarnings.emptyDescription')"
        />
        <div v-else class="finance-page__table">
          <div class="finance-page__table-head">
            <span>{{ t('appSections.finance.recentEarnings.date') }}</span>
            <span>{{ t('appSections.finance.recentEarnings.type') }}</span>
            <span>{{ t('appSections.finance.recentEarnings.titleCol') }}</span>
            <span>{{ t('appSections.finance.recentEarnings.amount') }}</span>
          </div>
          <div v-for="row in recentIncomes" :key="row.id" class="finance-page__table-row">
            <span>{{ row.occurredAt.slice(0, 10) }}</span>
            <span>{{ t('appSections.finance.recentEarnings.kind') }}</span>
            <span>{{ row.title ?? '—' }}</span>
            <strong class="finance-page__table-row-earning">{{ money(incomeAmount(row), row.currency) }}</strong>
          </div>
        </div>
      </section>
    </div>
    </AppSection>
  </div>
</template>

<style scoped>
.finance-page--loading {
  opacity: 0.85;
}

.finance-page__table {
  display: grid;
  gap: 0.4rem;
}

.finance-page__table-head,
.finance-page__table-row {
  display: grid;
  grid-template-columns: 8rem 8rem 1fr 8rem;
  gap: 0.65rem;
  align-items: center;
}

.finance-page__table-head {
  font-size: 0.68rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
  font-weight: 700;
}

.finance-page__table-head span:last-child {
  text-align: right;
}

.finance-page__table-row {
  background: var(--color-surface-container-lowest);
  border-radius: 0.65rem;
  padding: 0.5rem 0.6rem;
  font-size: 0.8rem;
}

.finance-page__table-row strong {
  text-align: right;
  color: var(--color-error);
}

.finance-page__table-row-earning {
  color: var(--color-success) !important;
}

@media (max-width: 48rem) {
  .finance-page__table-head,
  .finance-page__table-row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
