<script setup lang="ts">
import FinanceDateRangePicker from '~/components/finance/FinanceDateRangePicker.vue';

const props = defineProps<{
  period: string;
  dateFrom: string;
  dateTo: string;
}>();

const emit = defineEmits<{
  'update:period': [value: string];
  'update:dateFrom': [value: string];
  'update:dateTo': [value: string];
}>();

const { t } = useI18n();

const periods = ['currentWeek', 'currentMonth', 'currentYear', 'customRange'] as const;
</script>

<template>
  <section class="finance-filters">
    <div class="finance-filters__field">
      <span>{{ t('appSections.finance.filters.quickRange') }}</span>
      <div class="finance-filters__periods">
        <button
          v-for="periodKey in periods"
          :key="periodKey"
          type="button"
          class="finance-filters__period-btn"
          :aria-disabled="periodKey === 'customRange' ? 'true' : 'false'"
          :class="{ 'finance-filters__period-btn--active': props.period === periodKey }"
          @click="periodKey !== 'customRange' && emit('update:period', periodKey)"
        >
          {{ t(`appSections.finance.filters.periods.${periodKey}`) }}
        </button>
      </div>
    </div>

    <label class="finance-filters__field">
      <span>{{ t('appSections.finance.filters.dateRange') }}</span>
      <FinanceDateRangePicker
        :date-from="props.dateFrom"
        :date-to="props.dateTo"
        @update:date-from="emit('update:dateFrom', $event)"
        @update:date-to="emit('update:dateTo', $event)"
      />
    </label>
  </section>
</template>

<style scoped>
.finance-filters {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 0.75rem;
  align-items: end;
  background: var(--color-surface-container-low);
  border-radius: 1rem;
  padding: 0.8rem;
}

.finance-filters__periods {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.4rem;
  background: var(--color-surface-container-lowest);
  border-radius: 0.8rem;
  padding: 0.25rem;
}

.finance-filters__period-btn {
  border: 0;
  border-radius: 0.6rem;
  padding: 0.45rem 0.6rem;
  background: transparent;
  color: var(--color-on-surface-variant);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 180ms ease;
}

.finance-filters__period-btn--active {
  background: var(--color-secondary);
  color: var(--color-on-secondary);
}

.finance-filters__period-btn[aria-disabled='true'] {
  cursor: default;
  color: color-mix(in srgb, var(--color-on-surface-variant) 65%, transparent);
  background: color-mix(in srgb, var(--color-surface-container-high) 55%, transparent);
  font-weight: 600;
}

.finance-filters__period-btn[aria-disabled='true'].finance-filters__period-btn--active {
  color: var(--color-on-secondary);
  background: var(--color-secondary);
  font-weight: 700;
}

.finance-filters__field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.finance-filters__field span {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

@media (max-width: 70rem) {
  .finance-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 40rem) {
  .finance-filters {
    grid-template-columns: 1fr;
  }
}
</style>
