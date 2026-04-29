<script setup lang="ts">
defineProps<{
  items: Array<{
    label: string;
    dueDate: string;
    value: number;
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
  <section class="fleet-card fees-card">
    <div class="fleet-card__header">
      <h2 class="fleet-card__title">{{ t('appSections.fleet.vehicleDetails.carFeesTitle') }}</h2>
    </div>

    <div class="fees-card__list" v-if="items.length > 0">
      <article v-for="fee in items" :key="`${fee.label}-${fee.dueDate}`" class="fees-card__item">
        <p class="fees-card__item-label">{{ fee.label }}</p>
        <p class="fees-card__item-date">
          {{ t('appSections.fleet.vehicleDetails.dueDate', { date: fee.dueDate }) }}
        </p>
        <p class="fees-card__item-value">-{{ formatCurrency(fee.value) }}</p>
      </article>
    </div>
    <article v-else class="fees-card__empty">
      <p class="fees-card__empty-title">{{ t('appSections.fleet.vehicleDetails.emptyFeesTitle') }}</p>
      <p class="fees-card__empty-copy">{{ t('appSections.fleet.vehicleDetails.emptyFeesCopy') }}</p>
    </article>
    <div class="fleet-card__footer">
      <slot name="footer" />
    </div>
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

.fleet-card__footer {
  margin-top: 0.75rem;
  display: flex;
  justify-content: center;
}

.fees-card {
  padding-top: 0.95rem;
}

.fees-card__list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.fees-card__item {
  border-radius: 0.75rem;
  background: var(--color-surface-container-lowest);
  padding: 0.75rem 0.8rem;
}

.fees-card__item-label {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-on-surface);
}

.fees-card__item-date {
  margin: 0.3rem 0 0;
  font-size: 0.75rem;
  color: var(--color-on-surface-variant);
}

.fees-card__item-value {
  margin: 0.45rem 0 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--color-error);
}

.fees-card__empty {
  border-radius: 0.75rem;
  background: var(--color-surface-container-lowest);
  padding: 0.85rem;
}

.fees-card__empty-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-on-surface);
}

.fees-card__empty-copy {
  margin: 0.4rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-on-surface-variant);
}
</style>
