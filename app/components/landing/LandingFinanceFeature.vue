<template>
  <div class="feature-panel finance-panel">
    <div class="finance-panel__inner">
      <div class="finance-kpi">
        <span class="finance-kpi__label">{{ $t('featureFinance.revenue') }}</span>
        <span class="finance-kpi__value">14&nbsp;280&nbsp;zł</span>
        <span class="finance-kpi__meta">{{ $t('featureFinance.revenueLabel') }}</span>
      </div>
      <div class="finance-divider" aria-hidden="true" />
      <div class="finance-kpi">
        <span class="finance-kpi__label">{{ $t('featureFinance.costs') }}</span>
        <span class="finance-kpi__value">8&nbsp;940&nbsp;zł</span>
        <span class="finance-kpi__meta">{{ $t('featureFinance.costsLabel') }}</span>
      </div>
      <div class="finance-divider" aria-hidden="true" />
      <div class="finance-kpi finance-kpi--positive">
        <span class="finance-kpi__label">{{ $t('featureFinance.net') }}</span>
        <span class="finance-kpi__value">+5&nbsp;340&nbsp;zł</span>
        <span class="finance-kpi__meta">{{ $t('featureFinance.netLabel') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.finance-panel {
  height: 100%;
}

.finance-panel__inner {
  display: flex;
  align-items: stretch;
  height: 100%;
  padding: var(--space-6) var(--space-5);
  gap: 0;
}

.finance-divider {
  width: 1px;
  background: var(--color-outline);
  margin: 0 var(--space-5);
  flex-shrink: 0;
}

.finance-kpi {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.finance-kpi__label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.finance-kpi__value {
  font-family: var(--font-display);
  font-size: clamp(1.125rem, 2.5vw, 1.5rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.1;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.finance-kpi--positive .finance-kpi__value {
  color: var(--color-comply);
}

.finance-kpi__meta {
  font-size: 0.75rem;
  color: var(--color-muted);
}
</style>
