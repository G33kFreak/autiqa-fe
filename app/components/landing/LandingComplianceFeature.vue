<script setup lang="ts">
const deadlines = [
  { plate: 'GD 55100', type: 'inspection' as const, date: 'Jun 20', days: 3 },
  { plate: 'WI 12345', type: 'insurance' as const, date: 'Jul 12', days: 25 },
  { plate: 'KR 98765', type: 'insurance' as const, date: 'Aug 4', days: 47 },
]

function urgency(days: number): 'critical' | 'warn' | 'ok' {
  if (days <= 7) return 'critical'
  if (days <= 30) return 'warn'
  return 'ok'
}
</script>

<template>
  <div class="feature-panel compliance-panel">
    <div class="compliance-list">
      <div
        v-for="item in deadlines"
        :key="item.plate + item.type"
        class="compliance-row"
      >
        <div class="compliance-row__left">
          <span class="compliance-plate">{{ item.plate }}</span>
          <span class="compliance-type">
            {{ item.type === 'inspection' ? $t('featureCompliance.inspection') : $t('featureCompliance.insurance') }}
          </span>
        </div>
        <div class="compliance-row__right">
          <span class="compliance-date">{{ item.date }}</span>
          <span
            class="compliance-days"
            :class="`compliance-days--${urgency(item.days)}`"
          >
            {{ item.days === 1 ? $t('featureCompliance.dayLeft') : $t('featureCompliance.daysLeft', { n: item.days }) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.compliance-panel {
  height: 100%;
}

.compliance-list {
  display: flex;
  flex-direction: column;
}

.compliance-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-outline);
}

.compliance-row:last-child {
  border-bottom: none;
}

.compliance-row__left {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.compliance-plate {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
}

.compliance-type {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.compliance-row__right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

.compliance-date {
  font-size: 0.8125rem;
  color: var(--color-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.compliance-days {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.2em 0.6em;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.compliance-days--critical {
  color: var(--color-risk);
  background: var(--color-risk-bg);
}

.compliance-days--warn {
  color: var(--color-warn);
  background: var(--color-warn-bg);
}

.compliance-days--ok {
  color: var(--color-muted);
  background: var(--color-surface-mid);
}
</style>
