<script setup lang="ts">
import InitialsAvatar from '~/components/shared/InitialsAvatar.vue';

export type FleetIncomeHistoryRow = {
  id: string;
  titleLine: string;
  sourceLine: string;
  driverName: string;
  occurredLabel: string;
  amountNumber: string;
  currencyCode: string;
  icon: string;
};

withDefaults(
  defineProps<{
    rows: FleetIncomeHistoryRow[];
    /** When false, hides per-row edit/delete (e.g. read-only embeds). */
    showActions?: boolean;
  }>(),
  { showActions: true },
);

const emit = defineEmits<{
  edit: [id: string];
  delete: [id: string];
}>();

const { t } = useI18n();
</script>

<template>
  <div class="income-table" :class="{ 'income-table--no-actions': !showActions }">
    <div class="income-table__head" role="row">
      <div class="income-table__head-cell income-table__head-cell--source" role="columnheader">
        {{ t('appSections.fleet.vehicleDetails.incomeTableColTitleSource') }}
      </div>
      <div class="income-table__head-cell income-table__head-cell--driver" role="columnheader">
        {{ t('appSections.fleet.vehicleDetails.incomeTableColDriver') }}
      </div>
      <div class="income-table__head-cell income-table__head-cell--date" role="columnheader">
        {{ t('appSections.fleet.vehicleDetails.incomeTableColOccurredAt') }}
      </div>
      <div
        class="income-table__head-cell income-table__head-cell--amount"
        role="columnheader"
      >
        {{ t('appSections.fleet.vehicleDetails.incomeTableColAmount') }}
      </div>
      <div
        v-if="showActions"
        class="income-table__head-cell income-table__head-cell--actions"
        role="columnheader"
        :aria-label="t('appSections.fleet.vehicleDetails.incomeTableColActions')"
      />
    </div>
    <div class="income-table__body" role="rowgroup">
      <div
        v-for="row in rows"
        :key="row.id"
        class="income-table__row"
        role="row"
      >
        <div class="income-table__cell income-table__cell--source" role="cell">
          <div
            class="income-table__type-wrap"
            :class="{
              'income-table__type-wrap--single-title': !row.sourceLine.trim(),
            }"
          >
            <div class="income-table__type-icon" aria-hidden="true">
              <span class="material-symbols-outlined income-table__type-glyph">{{ row.icon }}</span>
            </div>
            <div class="income-table__titles">
              <p class="income-table__title-line">{{ row.titleLine }}</p>
              <p v-if="row.sourceLine.trim()" class="income-table__source-line">
                {{ row.sourceLine }}
              </p>
            </div>
          </div>
        </div>
        <div class="income-table__cell income-table__cell--driver" role="cell">
          <template v-if="row.driverName.trim()">
            <InitialsAvatar :label="row.driverName" size="sm" />
            <span class="income-table__driver-name">{{ row.driverName }}</span>
          </template>
          <span v-else class="income-table__driver-empty">—</span>
        </div>
        <div class="income-table__cell income-table__cell--date" role="cell">
          {{ row.occurredLabel }}
        </div>
        <div class="income-table__cell income-table__cell--amount" role="cell">
          <span class="income-table__amount-num">{{ row.amountNumber }}</span>
          <span class="income-table__amount-code">{{ row.currencyCode }}</span>
        </div>
        <div
          v-if="showActions"
          class="income-table__cell income-table__cell--actions"
          role="cell"
        >
          <div class="income-table__actions">
            <button
              type="button"
              class="income-table__action income-table__action--ghost"
              :aria-label="t('appSections.fleet.vehicleDetails.editExpense')"
              @click="emit('edit', row.id)"
            >
              <span
                class="material-symbols-outlined income-table__action-glyph"
                aria-hidden="true"
              >edit</span>
            </button>
            <button
              type="button"
              class="income-table__action income-table__action--danger"
              :aria-label="t('appSections.fleet.vehicleDetails.deleteExpense')"
              @click="emit('delete', row.id)"
            >
              <span
                class="material-symbols-outlined income-table__action-glyph"
                aria-hidden="true"
              >delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.income-table {
  border-radius: 1rem;
  padding: 0.25rem;
  background: var(--color-surface-container-lowest);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--color-on-surface) 2%, transparent);
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-x: auto;
}

.income-table__head {
  display: grid;
  grid-template-columns:
    minmax(6.5rem, 2fr) minmax(4.5rem, 1.45fr) minmax(4.25rem, 1.2fr) minmax(3.75rem, 0.95fr) minmax(2.25rem, auto);
  gap: 0.65rem 1rem;
  padding: 0.65rem 1rem 0.65rem 1.15rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
  background: var(--color-surface-container-low);
  border-radius: 0.75rem 0.75rem 0 0;
}

.income-table__head-cell--amount {
  text-align: right;
}

.income-table__head-cell--actions {
  text-align: right;
}

.income-table__body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.45rem;
}

.income-table__row {
  display: grid;
  grid-template-columns:
    minmax(6.5rem, 2fr) minmax(4.5rem, 1.45fr) minmax(4.25rem, 1.2fr) minmax(3.75rem, 0.95fr) minmax(2.25rem, auto);
  gap: 0.65rem 1rem;
  align-items: center;
  padding: 0.65rem 0.75rem;
  border-radius: 0.5rem;
  transition: background-color 0.15s ease;
}

.income-table__row:hover {
  background: var(--color-surface-container);
}

.income-table__cell--source {
  min-width: 0;
}

.income-table__type-wrap {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  min-width: 0;
}

.income-table__type-wrap--single-title {
  align-items: center;
}

.income-table__type-icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-container-high);
  color: var(--color-on-surface);
  transition: background-color 0.15s ease;
}

.income-table__row:hover .income-table__type-icon {
  background: var(--color-surface-container-lowest);
}

.income-table__type-glyph {
  font-size: 1.25rem;
  line-height: 1;
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'GRAD' 0,
    'opsz' 24;
}

.income-table__titles {
  min-width: 0;
}

.income-table__title-line {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-on-surface);
  line-height: 1.3;
}

.income-table__source-line {
  margin: 0.15rem 0 0;
  font-size: 0.75rem;
  color: var(--color-on-surface-variant);
  line-height: 1.35;
}

.income-table__cell--driver {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-on-surface);
}

.income-table__driver-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.income-table__driver-empty {
  color: var(--color-on-surface-variant);
  font-weight: 500;
}

.income-table__cell--date {
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
}

.income-table__cell--amount {
  text-align: right;
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-on-surface);
}

.income-table__amount-num {
  color: #059669;
}

.income-table__amount-code {
  margin-left: 0.25rem;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-on-surface-variant);
}

.income-table__cell--actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-width: 0;
}

.income-table__actions {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.28rem;
}

.income-table__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0.55rem;
  width: 2.125rem;
  height: 2.125rem;
  padding: 0;
  cursor: pointer;
  transition:
    opacity 0.18s ease,
    filter 0.18s ease;
}

.income-table__action:hover {
  opacity: 0.92;
  filter: brightness(0.97);
}

.income-table__action-glyph {
  font-size: 1.05rem;
  line-height: 1;
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'GRAD' 0,
    'opsz' 24;
}

.income-table__action--ghost {
  color: var(--color-on-surface);
  background: var(--color-surface-container-high);
}

.income-table__action--danger {
  color: var(--color-on-error-container);
  background: var(--color-error-container);
}

.income-table--no-actions .income-table__head,
.income-table--no-actions .income-table__row {
  grid-template-columns:
    minmax(6.5rem, 2fr) minmax(4.5rem, 1.45fr) minmax(4.25rem, 1.2fr) minmax(3.75rem, 1fr);
}

@media (max-width: 640px) {
  .income-table__head,
  .income-table__row {
    grid-template-columns:
      minmax(7rem, 1fr) minmax(3.5rem, 0.7fr) minmax(3.5rem, 0.75fr) minmax(3.25rem, 0.65fr) minmax(2.25rem, auto);
    gap: 0.5rem;
  }

  .income-table--no-actions .income-table__head,
  .income-table--no-actions .income-table__row {
    grid-template-columns:
      minmax(7rem, 1fr) minmax(3.5rem, 0.7fr) minmax(3.5rem, 0.75fr) minmax(3.25rem, 0.75fr);
  }
}
</style>
