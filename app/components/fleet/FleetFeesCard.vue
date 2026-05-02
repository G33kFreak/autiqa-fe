<script setup lang="ts">
import ListEmptyState from '~/components/shared/ListEmptyState.vue';

withDefaults(
  defineProps<{
    items: Array<{
      id: string;
      label: string;
      dueDate: string;
      value: number;
    }>;
    /** Hide the card title (e.g. when used with an external tab bar). */
    hideHeading?: boolean;
  }>(),
  { hideHeading: false },
);

const emit = defineEmits<{
  edit: [id: string];
  delete: [id: string];
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
    <div v-if="!hideHeading" class="fleet-card__header">
      <h2 class="fleet-card__title">{{ t('appSections.fleet.vehicleDetails.carFeesTitle') }}</h2>
    </div>

    <div class="fees-card__list" v-if="items.length > 0">
      <article v-for="fee in items" :key="fee.id" class="fees-card__item">
        <p class="fees-card__item-label">{{ fee.label }}</p>
        <p class="fees-card__item-date">
          {{ t('appSections.fleet.vehicleDetails.dueDate', { date: fee.dueDate }) }}
        </p>
        <p class="fees-card__item-value">-{{ formatCurrency(fee.value) }}</p>
        <div class="fees-card__item-actions">
          <button
            type="button"
            class="fees-card__item-action fees-card__item-action--ghost"
            @click="emit('edit', fee.id)"
          >
            {{ t('appSections.fleet.vehicleDetails.editExpense') }}
          </button>
          <button
            type="button"
            class="fees-card__item-action fees-card__item-action--danger"
            @click="emit('delete', fee.id)"
          >
            {{ t('appSections.fleet.vehicleDetails.deleteExpense') }}
          </button>
        </div>
      </article>
    </div>
    <article v-else class="fees-card__empty">
      <ListEmptyState
        icon="gavel"
        :title="t('appSections.fleet.vehicleDetails.emptyFeesTitle')"
        :description="t('appSections.fleet.vehicleDetails.emptyFeesCopy')"
      />
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

.fees-card__item-actions {
  margin-top: 0.65rem;
  display: inline-flex;
  gap: 0.4rem;
}

.fees-card__item-action {
  border: none;
  border-radius: 0.6rem;
  padding: 0.35rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.18s ease, filter 0.18s ease;
}

.fees-card__item-action:hover {
  opacity: 0.92;
  filter: brightness(0.97);
}

.fees-card__item-action--ghost {
  color: var(--color-on-surface);
  background: var(--color-surface-container-high);
}

.fees-card__item-action--danger {
  color: color-mix(in srgb, var(--color-error) 90%, white);
  background: color-mix(in srgb, var(--color-error) 14%, transparent);
}

.fees-card__empty {
  margin: 0;
  padding: 0;
  background: transparent;
}
</style>
