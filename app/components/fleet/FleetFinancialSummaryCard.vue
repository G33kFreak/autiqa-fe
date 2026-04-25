<script setup lang="ts">
const props = defineProps<{
  totalIncome: number;
  totalFees: number;
  totalMaintenance: number;
  totalOtherExpenses: number;
  totalCombinedExpenses: number;
  totalProfitLoss: number;
  isProfit: boolean;
}>();

const { t } = useI18n();
const hasNoData = computed(
  () =>
    props.totalIncome === 0 &&
    props.totalFees === 0 &&
    props.totalMaintenance === 0 &&
    props.totalOtherExpenses === 0 &&
    props.totalCombinedExpenses === 0 &&
    props.totalProfitLoss === 0,
);

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
</script>

<template>
  <section class="spend-card">
    <p class="spend-card__label">{{ t('appSections.fleet.vehicleDetails.financialSummary') }}</p>
    <p
      class="spend-card__total"
      :class="{
        'spend-card__total--profit': props.isProfit,
        'spend-card__total--loss': !props.isProfit,
      }"
    >
      {{ formatCurrency(props.totalProfitLoss) }}
    </p>
    <p v-if="hasNoData" class="spend-card__empty">
      {{ t('appSections.fleet.vehicleDetails.emptyFinancialSummary') }}
    </p>
    <div class="spend-card__list">
      <div class="spend-card__row">
        <span>{{ t('appSections.fleet.vehicleDetails.totalIncome') }}</span>
        <strong class="spend-card__value--income">{{ formatCurrency(props.totalIncome) }}</strong>
      </div>
      <div class="spend-card__row">
        <span>{{ t('appSections.fleet.vehicleDetails.totalFees') }}</span>
        <strong class="spend-card__value--expense">-{{ formatCurrency(props.totalFees) }}</strong>
      </div>
      <div class="spend-card__row">
        <span>{{ t('appSections.fleet.vehicleDetails.totalMaintenance') }}</span>
        <strong class="spend-card__value--expense">-{{ formatCurrency(props.totalMaintenance) }}</strong>
      </div>
      <div class="spend-card__row">
        <span>{{ t('appSections.fleet.vehicleDetails.totalOtherExpenses') }}</span>
        <strong class="spend-card__value--expense">-{{ formatCurrency(props.totalOtherExpenses) }}</strong>
      </div>
      <div class="spend-card__row">
        <span>{{ t('appSections.fleet.vehicleDetails.totalCombinedExpenses') }}</span>
        <strong class="spend-card__value--expense">-{{ formatCurrency(props.totalCombinedExpenses) }}</strong>
      </div>
      <div class="spend-card__row spend-card__row--emphasis">
        <span>{{ t('appSections.fleet.vehicleDetails.totalProfitLoss') }}</span>
        <strong
          :class="{
            'spend-card__value--profit': props.isProfit,
            'spend-card__value--loss': !props.isProfit,
          }"
        >
          {{ formatCurrency(props.totalProfitLoss) }}
        </strong>
      </div>
    </div>
  </section>
</template>

<style scoped>
.spend-card {
  border-radius: 1rem;
  padding: 1rem 1.125rem 1.1rem;
  background: #0f172a;
  color: #f8fafc;
}

.spend-card__label {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #94a3b8;
}

.spend-card__total {
  margin: 0.45rem 0 0.8rem;
  font-family: var(--font-display);
  font-size: clamp(1.9rem, 2.6vw, 2.4rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  font-weight: 800;
  color: #f8fafc;
}

.spend-card__total--profit {
  color: var(--color-success);
}

.spend-card__total--loss {
  color: var(--color-error);
}

.spend-card__list {
  display: flex;
  flex-direction: column;
}

.spend-card__empty {
  margin: 0 0 0.75rem;
  font-size: 0.8125rem;
  color: #cbd5e1;
}

.spend-card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 0.62rem 0;
  font-size: 0.95rem;
  color: #cbd5e1;
}

.spend-card__row + .spend-card__row {
  border-top: 1px solid rgb(148 163 184 / 0.22);
}

.spend-card__row strong {
  font-size: 1.05rem;
  color: #e2e8f0;
}

.spend-card__row--emphasis span,
.spend-card__row--emphasis strong {
  color: #f8fafc;
}

.spend-card__value--income {
  color: var(--color-success);
}

.spend-card__value--expense {
  color: var(--color-error);
}

.spend-card__value--profit {
  color: var(--color-success) !important;
}

.spend-card__value--loss {
  color: var(--color-error) !important;
}
</style>
