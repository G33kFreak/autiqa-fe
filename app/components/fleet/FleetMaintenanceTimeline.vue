<script setup lang="ts">
defineProps<{
  items: Array<{
    date: string;
    title: string;
    notes: string;
    amount: number;
  }>;
}>();

const { t } = useI18n();

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
  <section class="fleet-card fleet-card--timeline">
    <div class="fleet-card__header">
      <h2 class="fleet-card__title">{{ t('appSections.fleet.vehicleDetails.maintenanceHistory') }}</h2>
      <slot name="header-action" />
    </div>
    <div class="timeline" v-if="items.length > 0">
      <article
        v-for="(item, index) in items"
        :key="`${item.date}-${item.title}`"
        class="timeline-item"
        :class="{ 'timeline-item--active': index === 0 }"
      >
        <div class="timeline-item__dot" />
        <div class="timeline-item__row">
          <div class="timeline-item__content">
            <p class="timeline-item__date">{{ item.date }}</p>
            <h3 class="timeline-item__title">{{ item.title }}</h3>
            <p class="timeline-item__notes">{{ item.notes }}</p>
          </div>
          <p class="timeline-item__amount">-{{ formatCurrency(item.amount) }}</p>
        </div>
      </article>
    </div>
    <article v-else class="timeline-empty">
      <p class="timeline-empty__title">{{ t('appSections.fleet.vehicleDetails.emptyMaintenanceTitle') }}</p>
      <p class="timeline-empty__copy">{{ t('appSections.fleet.vehicleDetails.emptyMaintenanceCopy') }}</p>
    </article>
  </section>
</template>

<style scoped>
.fleet-card {
  border-radius: 1rem;
  background: var(--color-surface-container-low);
  padding: 1rem 1.125rem 1.1rem;
}

.fleet-card__header {
  margin-bottom: 0.875rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.8rem;
}

.fleet-card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--color-on-surface);
}

.fleet-card--timeline::after {
  display: none;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0.45rem;
  top: 0.25rem;
  bottom: 0.25rem;
  width: 0.2rem;
  border-radius: 999px;
  background: var(--color-surface-container-high);
}

.timeline-item {
  border-radius: 0.875rem;
  background: var(--color-surface-container-lowest);
  padding: 0.95rem 1rem;
  position: relative;
}

.timeline-item__dot {
  position: absolute;
  left: -1.825rem;
  top: 1.05rem;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: var(--color-secondary);
  box-shadow: 0 0 0 2px var(--color-surface-container-low);
}

.timeline-item__row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.timeline-item__content {
  min-width: 0;
}

.timeline-item__date {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.timeline-item__amount {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-error);
  white-space: nowrap;
}

.timeline-item__title {
  margin: 0.4rem 0 0.2rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-on-surface);
}

.timeline-item__notes {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.35;
  color: var(--color-on-surface-variant);
}

.timeline-empty {
  border-radius: 0.875rem;
  background: var(--color-surface-container-lowest);
  padding: 0.95rem 1rem;
}

.timeline-empty__title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-on-surface);
}

.timeline-empty__copy {
  margin: 0.4rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-on-surface-variant);
}
</style>
