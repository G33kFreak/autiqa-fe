<script setup lang="ts">
import type { LedgerEntryDto, LedgerCategory } from '#shared/dto/ledger-entry.dto';
import { formatMoney, formatDate } from '~/utils/format';
import { ledgerCategoryIcon } from '~/utils/asset-meta';

const props = defineProps<{
  ledger: LedgerEntryDto[];
  currency: string;
  totalIncome: number;
  totalExpense: number;
  expenseByCategory: Array<{ category: LedgerCategory; amount: number }>;
}>();

const emit = defineEmits<{
  add: [];
  edit: [entry: LedgerEntryDto];
  delete: [entry: LedgerEntryDto];
}>();

const { t, locale } = useI18n();

const sorted = computed(() =>
  [...props.ledger].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  ),
);

const money = (value: number | string) =>
  formatMoney(value, props.currency, locale.value);

function categoryLabel(category: LedgerCategory): string {
  return t(`app.car.ledger.categories.${category}`);
}

function signed(entry: LedgerEntryDto): string {
  const sign = entry.direction === 'income' ? '+' : '−';
  return `${sign}${money(entry.amount)}`;
}

const breakdownMax = computed(() =>
  Math.max(1, ...props.expenseByCategory.map((c) => c.amount)),
);
</script>

<template>
  <section class="fin" aria-labelledby="fin-title">
    <div class="ui-section-head">
      <div>
        <h2 id="fin-title" class="ui-section-title">{{ t('app.car.finances.title') }}</h2>
        <p class="ui-section-sub">{{ t('app.car.finances.subtitle') }}</p>
      </div>
      <button type="button" class="ui-btn ui-btn--primary ui-btn--sm" @click="emit('add')">
        <AppIcon name="plus" :size="18" />
        <span>{{ t('app.car.finances.add') }}</span>
      </button>
    </div>

    <div v-if="ledger.length === 0" class="ui-empty">
      <span class="ui-empty__icon" aria-hidden="true">
        <AppIcon name="wallet" :size="24" />
      </span>
      <h3 class="ui-empty__title">{{ t('app.car.finances.emptyTitle') }}</h3>
      <p class="ui-empty__body">{{ t('app.car.finances.emptyBody') }}</p>
      <button type="button" class="ui-btn ui-btn--secondary ui-btn--sm" @click="emit('add')">
        <AppIcon name="plus" :size="16" />
        <span>{{ t('app.car.finances.add') }}</span>
      </button>
    </div>

    <template v-else>
      <!-- Cost breakdown -->
      <div v-if="expenseByCategory.length" class="fin__breakdown">
        <h3 class="fin__breakdown-title">{{ t('app.car.finances.costBreakdown') }}</h3>
        <ul class="fin__bars">
          <li v-for="row in expenseByCategory" :key="row.category" class="fin__bar-row">
            <span class="fin__bar-label">{{ categoryLabel(row.category) }}</span>
            <span class="fin__bar-track" aria-hidden="true">
              <span
                class="fin__bar-fill"
                :style="{ transform: `scaleX(${Math.max(0.02, row.amount / breakdownMax)})` }"
              />
            </span>
            <span class="fin__bar-value">{{ money(row.amount) }}</span>
          </li>
        </ul>
      </div>

      <!-- Ledger -->
      <ul class="fin__list">
        <li v-for="entry in sorted" :key="entry.id" class="fin__entry">
          <span
            class="fin__entry-icon"
            :data-direction="entry.direction"
            aria-hidden="true"
          >
            <AppIcon :name="ledgerCategoryIcon(entry.category)" :size="18" />
          </span>
          <div class="fin__entry-copy">
            <span class="fin__entry-title">
              {{ entry.note?.trim() || categoryLabel(entry.category) }}
            </span>
            <span class="fin__entry-meta">
              {{ categoryLabel(entry.category) }} · {{ formatDate(entry.occurredAt, locale) }}
            </span>
          </div>
          <span class="fin__entry-amount" :data-direction="entry.direction">
            {{ signed(entry) }}
          </span>
          <div class="fin__entry-actions">
            <button
              type="button"
              class="ui-iconbtn"
              :aria-label="t('app.common.edit')"
              @click="emit('edit', entry)"
            >
              <AppIcon name="edit" :size="16" />
            </button>
            <button
              type="button"
              class="ui-iconbtn ui-iconbtn--danger"
              :aria-label="t('app.common.delete')"
              @click="emit('delete', entry)"
            >
              <AppIcon name="trash" :size="16" />
            </button>
          </div>
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
.fin {
  display: flex;
  flex-direction: column;
}

/* ── Breakdown ────────────────────────────────────────────── */
.fin__breakdown {
  padding: var(--space-4);
  margin-bottom: var(--space-5);
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.fin__breakdown-title {
  margin: 0 0 var(--space-3);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.fin__bars {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.fin__bar-row {
  display: grid;
  grid-template-columns: 9rem 1fr auto;
  align-items: center;
  gap: var(--space-3);
}

.fin__bar-label {
  font-size: 0.875rem;
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fin__bar-track {
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-surface-high);
  overflow: hidden;
}

.fin__bar-fill {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  transform-origin: left center;
  transition: transform var(--duration-slow) var(--ease-out);
}

@media (prefers-reduced-motion: reduce) {
  .fin__bar-fill {
    transition: none;
  }
}

.fin__bar-value {
  font-size: 0.875rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
  white-space: nowrap;
}

/* ── Ledger list ──────────────────────────────────────────── */
.fin__list {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.fin__entry {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0.75rem var(--space-4);
  transition: background-color var(--duration-fast) var(--ease-out);
}

.fin__entry:not(:last-child) {
  border-bottom: 1px solid var(--color-surface-mid);
}

.fin__entry:hover {
  background: var(--color-surface);
}

.fin__entry-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-surface-mid);
  color: var(--color-muted);
}

.fin__entry-icon[data-direction='income'] {
  background: var(--color-comply-bg);
  color: var(--color-comply);
}

.fin__entry-icon[data-direction='expense'] {
  background: var(--color-surface-high);
  color: var(--color-ink);
}

.fin__entry-copy {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.fin__entry-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fin__entry-meta {
  font-size: 0.8125rem;
  color: var(--color-muted);
}

.fin__entry-amount {
  font-size: 0.9375rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.fin__entry-amount[data-direction='income'] {
  color: var(--color-comply);
}

.fin__entry-amount[data-direction='expense'] {
  color: var(--color-ink);
}

.fin__entry-actions {
  display: flex;
  gap: 0.1rem;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.fin__entry:hover .fin__entry-actions,
.fin__entry:focus-within .fin__entry-actions {
  opacity: 1;
}

@media (max-width: 600px) {
  .fin__bar-row {
    grid-template-columns: 7rem 1fr auto;
  }
  /* Touch has no hover — keep row actions visible. */
  .fin__entry-actions {
    opacity: 1;
  }
}
</style>
