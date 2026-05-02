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
  <aside class="financial-bento" aria-label="financial-bento">
    <div class="financial-bento__shell">
      <div class="financial-bento__primary">
        <div class="financial-bento__accent" aria-hidden="true" />
        <p class="financial-bento__eyebrow">
          {{ t('appSections.fleet.vehicleDetails.bentoNetProfit') }}
        </p>
        <p
          class="financial-bento__profit"
          :class="{
            'financial-bento__profit--profit': props.isProfit,
            'financial-bento__profit--loss': !props.isProfit,
          }"
        >
          {{ formatCurrency(props.totalProfitLoss) }}
        </p>
        <p v-if="hasNoData" class="financial-bento__empty">
          {{ t('appSections.fleet.vehicleDetails.emptyFinancialSummary') }}
        </p>
      </div>
      <div class="financial-bento__pair">
        <div class="financial-bento__tile">
          <p class="financial-bento__tile-label">
            {{ t('appSections.fleet.vehicleDetails.bentoTotalRevenue') }}
          </p>
          <p class="financial-bento__tile-value">
            {{ formatCurrency(props.totalIncome) }}
          </p>
        </div>
        <div class="financial-bento__tile">
          <p class="financial-bento__tile-label">
            {{ t('appSections.fleet.vehicleDetails.bentoTotalExpenses') }}
          </p>
          <p class="financial-bento__tile-value">
            {{ formatCurrency(props.totalCombinedExpenses) }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.financial-bento {
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  box-sizing: border-box;
}

.financial-bento__shell {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 1rem;
  background: var(--color-surface-container-low);
  height: 100%;
}

.financial-bento__primary {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1.15rem 1.15rem 1.15rem 1.35rem;
  border-radius: 0.75rem;
  background: var(--color-surface-container-lowest);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--color-on-surface) 2%, transparent);
  overflow: hidden;
  transition: background-color 0.18s ease;
}

.financial-bento__primary:hover {
  background: var(--color-surface-bright);
}

.financial-bento__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0.25rem;
  background: var(--color-secondary);
  border-radius: 0.125rem 0 0 0.125rem;
}

.financial-bento__eyebrow {
  margin: 0 0 0.25rem;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.financial-bento__profit {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.35rem, 2.2vw, 1.65rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: var(--color-on-surface);
}

.financial-bento__profit--profit {
  color: #059669;
}

.financial-bento__profit--loss {
  color: var(--color-error);
}

.financial-bento__empty {
  margin: 0.5rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-on-surface-variant);
}

.financial-bento__pair {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.financial-bento__tile {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.9rem 1rem;
  border-radius: 0.75rem;
  background: var(--color-surface-container-lowest);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--color-on-surface) 2%, transparent);
}

.financial-bento__tile-label {
  margin: 0 0 0.2rem;
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.financial-bento__tile-value {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-on-surface);
}
</style>
