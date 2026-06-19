<script setup lang="ts">
import type { LedgerEntryDto } from '#shared/dto/ledger-entry.dto';
import { formatMoney, formatDate } from '~/utils/format';

const props = defineProps<{
  entries: LedgerEntryDto[];
  currency: string;
  total: number;
  lastServiceDate: string | null;
}>();

const emit = defineEmits<{
  add: [];
  edit: [entry: LedgerEntryDto];
  delete: [entry: LedgerEntryDto];
}>();

const { t, locale } = useI18n();

const money = (value: number | string) =>
  formatMoney(value, props.currency, locale.value);

/** Service log grouped by year so the timeline reads as distinct seasons. */
const groups = computed(() => {
  const map = new Map<number, LedgerEntryDto[]>();
  for (const entry of props.entries) {
    const year = new Date(entry.occurredAt).getFullYear();
    const bucket = map.get(year);
    if (bucket) bucket.push(entry);
    else map.set(year, [entry]);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({ year, items }));
});

const daysSinceLast = computed(() => {
  if (!props.lastServiceDate) return null;
  const ms = Date.now() - new Date(props.lastServiceDate).getTime();
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.floor(ms / 86_400_000));
});

const lastServiceLabel = computed(() => {
  const d = daysSinceLast.value;
  if (d === null) return '—';
  if (d === 0) return t('app.car.maintenance.today');
  if (d === 1) return t('app.car.maintenance.yesterday');
  return t('app.car.maintenance.daysAgo', { n: d });
});
</script>

<template>
  <section class="mnt" aria-labelledby="mnt-title">
    <div class="ui-section-head">
      <div>
        <h2 id="mnt-title" class="ui-section-title">{{ t('app.car.maintenance.title') }}</h2>
        <p class="ui-section-sub">{{ t('app.car.maintenance.subtitle') }}</p>
      </div>
      <button type="button" class="ui-btn ui-btn--primary ui-btn--sm" @click="emit('add')">
        <AppIcon name="wrench" :size="17" />
        <span>{{ t('app.car.maintenance.log') }}</span>
      </button>
    </div>

    <!-- Empty -->
    <div v-if="entries.length === 0" class="ui-empty">
      <span class="ui-empty__icon" aria-hidden="true">
        <AppIcon name="wrench" :size="24" />
      </span>
      <h3 class="ui-empty__title">{{ t('app.car.maintenance.emptyTitle') }}</h3>
      <p class="ui-empty__body">{{ t('app.car.maintenance.emptyBody') }}</p>
      <button type="button" class="ui-btn ui-btn--secondary ui-btn--sm" @click="emit('add')">
        <AppIcon name="plus" :size="16" />
        <span>{{ t('app.car.maintenance.log') }}</span>
      </button>
    </div>

    <template v-else>
      <!-- Summary -->
      <dl class="mnt__stats">
        <div class="mnt__stat">
          <dt class="mnt__stat-label">{{ t('app.car.maintenance.totalSpent') }}</dt>
          <dd class="mnt__stat-value">{{ money(total) }}</dd>
        </div>
        <div class="mnt__stat">
          <dt class="mnt__stat-label">{{ t('app.car.maintenance.servicesLogged') }}</dt>
          <dd class="mnt__stat-value">{{ entries.length }}</dd>
        </div>
        <div class="mnt__stat">
          <dt class="mnt__stat-label">{{ t('app.car.maintenance.lastService') }}</dt>
          <dd class="mnt__stat-value">{{ lastServiceLabel }}</dd>
        </div>
      </dl>

      <!-- Timeline -->
      <div class="mnt__feed">
        <section v-for="group in groups" :key="group.year" class="mnt__group">
          <h3 class="mnt__year">{{ group.year }}</h3>
          <ol class="mnt__events">
            <li v-for="entry in group.items" :key="entry.id" class="mnt__event">
              <span class="mnt__rail" aria-hidden="true">
                <span class="mnt__node">
                  <AppIcon name="wrench" :size="18" />
                </span>
              </span>
              <div class="mnt__card">
                <div class="mnt__card-head">
                  <span class="mnt__card-title">
                    {{ entry.note?.trim() || t('app.car.maintenance.defaultTitle') }}
                  </span>
                  <span class="mnt__amount">−{{ money(entry.amount) }}</span>
                </div>
                <div class="mnt__card-foot">
                  <span class="mnt__date">
                    <AppIcon name="calendar" :size="14" />
                    <span>{{ formatDate(entry.occurredAt, locale) }}</span>
                  </span>
                  <div class="mnt__actions">
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
                </div>
              </div>
            </li>
          </ol>
        </section>
      </div>
    </template>
  </section>
</template>

<style scoped>
.mnt {
  display: flex;
  flex-direction: column;
  --mnt-node: 2.25rem;
  --mnt-node-center: 1.125rem;
}

/* ── Summary ──────────────────────────────────────────────── */
.mnt__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-3);
  margin: 0 0 var(--space-6);
}

.mnt__stat {
  display: grid;
  grid-template-rows: 1.25rem auto;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-lg);
  background: var(--color-bg);
  min-width: 0;
}

.mnt__stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-muted);
}

.mnt__stat-value {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Timeline ─────────────────────────────────────────────── */
.mnt__feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.mnt__year {
  margin: 0 0 var(--space-3);
  padding-left: calc(var(--mnt-node) + var(--space-4));
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
  color: var(--color-muted);
}

.mnt__events {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.mnt__event {
  position: relative;
  display: grid;
  grid-template-columns: var(--mnt-node) minmax(0, 1fr);
  gap: var(--space-4);
  padding-bottom: var(--space-4);
}

.mnt__event:last-child {
  padding-bottom: 0;
}

.mnt__rail {
  position: relative;
  display: flex;
  justify-content: center;
}

/* Connector runs from this node down to the next one; the next node's ring
   covers the seam. Hidden on the last event so each year closes cleanly. */
.mnt__rail::before {
  content: '';
  position: absolute;
  top: var(--mnt-node-center);
  bottom: calc(-1 * (var(--space-4) + var(--mnt-node-center)));
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: var(--color-outline);
}

.mnt__event:last-child .mnt__rail::before {
  display: none;
}

.mnt__node {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--mnt-node);
  height: var(--mnt-node);
  border-radius: var(--radius-full);
  background: var(--color-surface-high);
  color: var(--color-ink);
  box-shadow: 0 0 0 4px var(--color-bg);
}

.mnt__card {
  min-width: 0;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-lg);
  background: var(--color-bg);
  transition: background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.mnt__card:hover {
  background: var(--color-surface);
  border-color: oklch(0.78 0.01 268);
}

.mnt__card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
}

.mnt__card-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mnt__amount {
  flex-shrink: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
  white-space: nowrap;
}

.mnt__card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-2);
  min-height: 2.125rem;
}

.mnt__date {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-muted);
  min-width: 0;
}

.mnt__date :deep(svg) {
  flex-shrink: 0;
}

.mnt__actions {
  display: flex;
  gap: 0.1rem;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.mnt__event:hover .mnt__actions,
.mnt__event:focus-within .mnt__actions {
  opacity: 1;
}

@media (max-width: 640px) {
  .mnt__stats {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .mnt__stat:first-child {
    grid-column: 1 / -1;
  }

  /* Touch has no hover — keep row actions reachable. */
  .mnt__actions {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mnt__card,
  .mnt__actions {
    transition: none;
  }
}
</style>
