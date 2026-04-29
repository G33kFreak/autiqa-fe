<script setup lang="ts">
import type { ExpenseDto } from '#shared/dto/expense.dto';
import FinanceCategoryDonutChart from '~/components/finance/charts/FinanceCategoryDonutChart.vue';
import FinanceCumulativeProfitChart from '~/components/finance/charts/FinanceCumulativeProfitChart.vue';
import FinanceSpendTrendChart from '~/components/finance/charts/FinanceSpendTrendChart.vue';
import FinanceTopCarsChart from '~/components/finance/charts/FinanceTopCarsChart.vue';
import FinanceFilters from '~/components/finance/FinanceFilters.vue';
import FinanceKpiCard from '~/components/finance/FinanceKpiCard.vue';
import { createFinanceExpenseMocks } from '~/mocks/finance-expenses.mock';

const { t } = useI18n();

useSeoMeta({
  title: computed(() => t('appSections.finance.title')),
  description: computed(() => t('appSections.finance.lead')),
});

const rows = ref<ExpenseDto[]>(createFinanceExpenseMocks(190));
const period = ref('currentMonth');

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

function carPlateFromId(carId: string): string {
  const num = Number.parseInt(carId.replace(/\D/g, ''), 10);
  const safe = Number.isFinite(num) ? num : 0;
  return `WX ${String(1000 + safe).padStart(4, '0')}`;
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
const applyingPreset = ref(false);

const availableTypes = ['MAINTENANCE', 'CAR_PAYMENT', 'INSURANCE', 'FEE', 'OTHER'];

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

const filteredRows = computed(() => {
  const from = parseDayBoundary(dateFrom.value) ?? new Date('1970-01-01T00:00:00');
  const to = parseDayBoundary(dateTo.value, true) ?? new Date('2999-12-31T23:59:59');
  return rows.value.filter((item) => {
    const itemDate = new Date(item.occurredAt);
    return itemDate >= from && itemDate <= to;
  });
});

function amountOf(expense: ExpenseDto): number {
  return Number.parseFloat(expense.amount) || 0;
}

function money(value: number, c = 'PLN'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: c,
    maximumFractionDigits: 0,
  }).format(value);
}

const totalSpend = computed(() => filteredRows.value.reduce((sum, row) => sum + amountOf(row), 0));
const daySpan = computed(() => {
  const from = parseDayBoundary(dateFrom.value) ?? new Date();
  const to = parseDayBoundary(dateTo.value, true) ?? new Date();
  const diff = Math.ceil((to.getTime() - from.getTime()) / 86400000);
  return Math.max(diff, 1);
});
const avgDailySpend = computed(() => totalSpend.value / daySpan.value);
const totalRevenue = computed(() => totalSpend.value * 1.42);
const avgDailyRevenue = computed(() => totalRevenue.value / daySpan.value);
const largestExpense = computed(() => Math.max(...filteredRows.value.map(amountOf), 0));
const concentration = computed(() => {
  const map = new Map<string, number>();
  for (const row of filteredRows.value) map.set(row.type, (map.get(row.type) ?? 0) + amountOf(row));
  const top = Math.max(...Array.from(map.values()), 0);
  return totalSpend.value > 0 ? (top / totalSpend.value) * 100 : 0;
});
const anomalyCount = computed(() => filteredRows.value.filter((row) => amountOf(row) > avgDailySpend.value * 2.4).length);

const spendTrend = computed(() => {
  const byDay = new Map<string, number>();
  for (const row of filteredRows.value) {
    const key = row.occurredAt.slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + amountOf(row));
  }

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
    spendValues: keys.map((key) => Number((-(byDay.get(key) ?? 0)).toFixed(2))),
    revenueValues: keys.map((key, index) => {
      const spend = byDay.get(key) ?? 0;
      const factor = 1 + Math.sin(index * 0.65) * 0.22 + Math.cos(index * 0.33) * 0.08;
      return Number((Math.max(spend * factor, 0)).toFixed(2));
    }),
    profitLossValues: keys.map((key, index) => {
      const spend = byDay.get(key) ?? 0;
      const factor = 1 + Math.sin(index * 0.65) * 0.22 + Math.cos(index * 0.33) * 0.08;
      const revenue = Math.max(spend * factor, 0);
      return Number((revenue - spend).toFixed(2));
    }),
  };
});

const categoryDonutRows = computed(() => {
  const byType = new Map<string, number>();
  for (const row of filteredRows.value) byType.set(row.type, (byType.get(row.type) ?? 0) + amountOf(row));
  return Array.from(byType.entries()).map(([name, value]) => ({
    name: t(`appSections.finance.types.${name}`),
    value: Number(value.toFixed(2)),
  }));
});

const cumulativeProfit = computed(() => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const monthlyProfit = new Array<number>(12).fill(0);

  for (const row of rows.value) {
    const d = new Date(row.occurredAt);
    if (d.getFullYear() !== currentYear) continue;
    const month = d.getMonth();
    const spend = amountOf(row);
    const revenue = spend * 1.42;
    const pnl = revenue - spend;
    monthlyProfit[month] += pnl;
  }

  const labels = Array.from({ length: 12 }, (_, month) =>
    `${currentYear}-${String(month + 1).padStart(2, '0')}`,
  );

  const actualMonthly = monthlyProfit.slice(0, currentMonthIndex + 1);
  const avgMonthlyProfit = actualMonthly.length
    ? actualMonthly.reduce((sum, v) => sum + v, 0) / actualMonthly.length
    : 0;

  const actualValues: Array<number | null> = [];
  const projectedValues: Array<number | null> = [];
  let running = 0;
  for (let month = 0; month < 12; month += 1) {
    if (month <= currentMonthIndex) {
      running += monthlyProfit[month] ?? 0;
      const value = Number(running.toFixed(2));
      actualValues.push(value);
      projectedValues.push(month === currentMonthIndex ? value : null);
      continue;
    }
    running += avgMonthlyProfit;
    actualValues.push(null);
    projectedValues.push(Number(running.toFixed(2)));
  }

  return {
    labels,
    actualValues,
    projectedValues,
  };
});

const topCarsRevenue = computed(() => {
  const byCar = new Map<string, number>();
  for (const row of filteredRows.value) {
    if (!row.carId) continue;
    const spend = amountOf(row);
    const revenue = spend * 1.42;
    byCar.set(row.carId, (byCar.get(row.carId) ?? 0) + revenue);
  }
  const top = Array.from(byCar.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);
  return {
    labels: top.map(([carId]) => carPlateFromId(carId)),
    values: top.map(([, value]) => Number(value.toFixed(2))),
  };
});

const topCars = computed(() => {
  const byCar = new Map<string, number>();
  for (const row of filteredRows.value) {
    if (!row.carId) continue;
    byCar.set(row.carId, (byCar.get(row.carId) ?? 0) + amountOf(row));
  }
  const top = Array.from(byCar.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);
  return {
    labels: top.map(([carId]) => carPlateFromId(carId)),
    values: top.map(([, value]) => Number(value.toFixed(2))),
  };
});

const recentEarnings = computed(() =>
  filteredRows.value
    .slice(0, 10)
    .map((row) => {
      const spend = amountOf(row);
      const earnings = Math.max(spend * 1.42, 0);
      return {
        id: row.id,
        occurredAt: row.occurredAt,
        title: row.title,
        type: row.type,
        currency: row.currency,
        earnings,
      };
    }),
);
const recentExpenses = computed(() => filteredRows.value.slice(0, 10));
</script>

<template>
  <div class="finance-page">
    <h1 class="app-page__title">{{ t('appSections.finance.title') }}</h1>
    <p class="app-page__lead">{{ t('appSections.finance.lead') }}</p>

    <FinanceFilters
      :period="period"
      :date-from="dateFrom"
      :date-to="dateTo"
      @update:period="period = $event"
      @update:date-from="dateFrom = $event"
      @update:date-to="dateTo = $event"
    />

    <section class="finance-page__kpis">
      <FinanceKpiCard :label="t('appSections.finance.kpis.totalSpend')" :value="money(totalSpend)" tone="warn" />
      <FinanceKpiCard :label="t('appSections.finance.kpis.avgDaily')" :value="money(avgDailySpend)" />
      <FinanceKpiCard :label="t('appSections.finance.kpis.totalRevenue')" :value="money(totalRevenue)" tone="good" />
      <FinanceKpiCard :label="t('appSections.finance.kpis.avgRevenueDaily')" :value="money(avgDailyRevenue)" tone="good" />
    </section>

    <section class="finance-page__grid">
      <article class="finance-page__card finance-page__card--wide">
        <h2 class="finance-page__card-title">{{ t('appSections.finance.charts.spendTrend') }}</h2>
        <FinanceSpendTrendChart
          :labels="spendTrend.labels"
          :spend-values="spendTrend.spendValues"
          :revenue-values="spendTrend.revenueValues"
          :profit-loss-values="spendTrend.profitLossValues"
        />
      </article>

      <article class="finance-page__card">
        <h2 class="finance-page__card-title">{{ t('appSections.finance.charts.categoryMix') }}</h2>
        <FinanceCategoryDonutChart :rows="categoryDonutRows" />
      </article>

      <article class="finance-page__card">
        <h2 class="finance-page__card-title">{{ t('appSections.finance.charts.typeBreakdown') }}</h2>
        <FinanceCumulativeProfitChart
          :labels="cumulativeProfit.labels"
          :actual-values="cumulativeProfit.actualValues"
          :projected-values="cumulativeProfit.projectedValues"
        />
      </article>

      <article class="finance-page__card">
        <h2 class="finance-page__card-title">{{ t('appSections.finance.charts.intensity') }}</h2>
        <FinanceTopCarsChart :labels="topCars.labels" :values="topCars.values" color="#ba1a1a" />
      </article>

      <article class="finance-page__card">
        <h2 class="finance-page__card-title">{{ t('appSections.finance.charts.recurring') }}</h2>
        <FinanceTopCarsChart :labels="topCarsRevenue.labels" :values="topCarsRevenue.values" color="#0f8a46" />
      </article>
    </section>

    <div class="finance-page__bottom">
      <section class="finance-page__table-card">
        <h2 class="finance-page__card-title">{{ t('appSections.finance.recent.title') }}</h2>
        <div class="finance-page__table">
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

      <section class="finance-page__table-card">
        <h2 class="finance-page__card-title">{{ t('appSections.finance.recentEarnings.title') }}</h2>
        <div class="finance-page__table">
          <div class="finance-page__table-head">
            <span>{{ t('appSections.finance.recentEarnings.date') }}</span>
            <span>{{ t('appSections.finance.recentEarnings.type') }}</span>
            <span>{{ t('appSections.finance.recentEarnings.titleCol') }}</span>
            <span>{{ t('appSections.finance.recentEarnings.amount') }}</span>
          </div>
          <div v-for="row in recentEarnings" :key="row.id" class="finance-page__table-row">
            <span>{{ row.occurredAt.slice(0, 10) }}</span>
            <span>{{ t(`appSections.finance.types.${row.type}`) }}</span>
            <span>{{ row.title }}</span>
            <strong class="finance-page__table-row-earning">{{ money(row.earnings, row.currency) }}</strong>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.finance-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.finance-page__kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.finance-page__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.finance-page__card {
  background: var(--color-surface-container-low);
  border-radius: 1rem;
  padding: 0.85rem;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.finance-page__card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-ambient);
}

.finance-page__card--wide {
  grid-column: 1 / -1;
}

.finance-page__card-title {
  margin: 0 0 0.5rem;
  font-size: 0.76rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.finance-page__bottom {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.finance-page__table-card {
  background: var(--color-surface-container-low);
  border-radius: 1rem;
  padding: 0.95rem;
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
  color: #0f8a46 !important;
}

@media (max-width: 75rem) {
  .finance-page__kpis {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .finance-page__bottom {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 62rem) {
  .finance-page__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 48rem) {
  .finance-page__kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .finance-page__table-head,
  .finance-page__table-row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
