<script setup lang="ts">
import type { ComplianceTone } from '~/utils/compliance';
import type { IconName } from '~/components/app/Icon.vue';
import { formatMoney } from '~/utils/format';

const props = defineProps<{
  net: number;
  totalIncome: number;
  totalExpense: number;
  currency: string;
  isProfit: boolean;
  worstTone: ComplianceTone;
  complianceLabel: string;
}>();

const { t, locale } = useI18n();

const money = (value: number) => formatMoney(value, props.currency, locale.value);

/** One uniform tile model so every card shares the same structure and rhythm. */
const tiles = computed<
  Array<{ key: string; label: string; icon: IconName; value: string; tone: 'ink' | 'ok' | 'risk' | ComplianceTone }>
>(() => [
  {
    key: 'net',
    label: t('app.car.signal.net'),
    icon: props.isProfit ? 'trending-up' : 'trending-down',
    value: money(props.net),
    tone: props.isProfit ? 'ok' : 'risk',
  },
  {
    key: 'income',
    label: t('app.car.signal.income'),
    icon: 'wallet',
    value: money(props.totalIncome),
    tone: 'ink',
  },
  {
    key: 'expenses',
    label: t('app.car.signal.expenses'),
    icon: 'receipt',
    value: money(props.totalExpense),
    tone: 'ink',
  },
  {
    key: 'compliance',
    label: t('app.car.signal.compliance'),
    icon: props.worstTone === 'ok' ? 'shield' : 'alert',
    value: props.complianceLabel,
    tone: props.worstTone,
  },
]);
</script>

<template>
  <dl class="sig">
    <div v-for="tile in tiles" :key="tile.key" class="sig__tile">
      <dt class="sig__label">
        <AppIcon :name="tile.icon" :size="16" />
        <span>{{ tile.label }}</span>
      </dt>
      <dd class="sig__value" :data-tone="tile.tone">{{ tile.value }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.sig {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-3);
  margin: 0;
}

.sig__tile {
  /* Two fixed rows so labels align across all tiles and values share a baseline. */
  display: grid;
  grid-template-rows: 1.25rem auto;
  align-content: start;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-lg);
  background: var(--color-bg);
  min-width: 0;
}

.sig__label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--color-muted);
  min-width: 0;
}

.sig__label > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sig__label :deep(svg) {
  flex-shrink: 0;
}

.sig__value {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Hierarchy lives in colour, not size — every value keeps the same scale. */
.sig__value[data-tone='ok'] {
  color: var(--color-comply);
}

.sig__value[data-tone='risk'],
.sig__value[data-tone='urgent'],
.sig__value[data-tone='overdue'] {
  color: var(--color-risk);
}

.sig__value[data-tone='soon'] {
  color: var(--color-warn-text);
}

.sig__value[data-tone='missing'] {
  color: var(--color-muted);
}

@media (max-width: 900px) {
  .sig {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 460px) {
  .sig {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
