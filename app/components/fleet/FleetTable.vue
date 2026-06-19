<script setup lang="ts">
import type { CarDto } from '#shared/dto/car.dto';
import { complianceStatus, type ComplianceTone } from '~/utils/compliance';

const props = defineProps<{
  cars: CarDto[];
  /** Ids of just-created cars, briefly highlighted so they're easy to spot. */
  highlightedIds?: Set<string>;
}>();

const { t, locale } = useI18n();
const localePath = useLocalePath();

function detailPath(id: string): string {
  return localePath(`/app/fleet/${id}`);
}

/** Navigate on row click, unless the user clicked a real link/control inside it. */
function onRowClick(event: MouseEvent, id: string) {
  const target = event.target as HTMLElement;
  if (target.closest('a, button')) return;
  navigateTo(detailPath(id));
}

const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
);

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.value.format(date);
}

function driverName(car: CarDto): string {
  if (!car.driver) return t('app.fleet.table.unassigned');
  return `${car.driver.firstName} ${car.driver.lastName}`.trim();
}

/** Tones that demand action now — rendered red, with the alert glyph instead of a dot. */
const ALERT_TONES = new Set<ComplianceTone>(['urgent', 'overdue']);

interface ComplianceView {
  tone: ComplianceTone;
  /** Short, human status line — carries the meaning the tone colour hints at. */
  label: string;
  /** True for tones that need an alert icon, so severity reads without colour. */
  isAlert: boolean;
}

function complianceView(value: string | null): ComplianceView {
  const { tone, daysLeft } = complianceStatus(value);
  const isAlert = ALERT_TONES.has(tone);
  let label: string;
  if (tone === 'missing' || daysLeft === null) {
    label = t('app.fleet.compliance.notSet');
  } else if (tone === 'overdue') {
    label = t('app.fleet.compliance.overdue', { n: Math.abs(daysLeft) });
  } else if (daysLeft === 0) {
    label = t('app.fleet.compliance.today');
  } else {
    label = t('app.fleet.compliance.inDays', { n: daysLeft });
  }
  return { tone, label, isAlert };
}

/** Cars paired with their resolved compliance views — computed once per render. */
const rows = computed(() =>
  props.cars.map((car) => ({
    car,
    inspection: complianceView(car.inspectionValidUntil),
    insurance: complianceView(car.insuranceValidUntil),
  })),
);

function isHighlighted(id: string): boolean {
  return props.highlightedIds?.has(id) ?? false;
}
</script>

<template>
  <div class="ft" role="region" :aria-label="t('app.fleet.table.caption')">
    <table class="ft__table">
      <caption class="ft__sr">{{ t('app.fleet.table.caption') }}</caption>
      <thead>
        <tr>
          <th scope="col">{{ t('app.fleet.table.vehicle') }}</th>
          <th scope="col">{{ t('app.fleet.table.plate') }}</th>
          <th scope="col">{{ t('app.fleet.table.vin') }}</th>
          <th scope="col">{{ t('app.fleet.table.driver') }}</th>
          <th scope="col">{{ t('app.fleet.table.inspection') }}</th>
          <th scope="col">{{ t('app.fleet.table.insurance') }}</th>
          <th scope="col"><span class="ft__sr">{{ t('app.fleet.table.open') }}</span></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="{ car, inspection, insurance } in rows"
          :key="car.id"
          class="ft__row ft__row--link"
          :class="{ 'ft__row--new': isHighlighted(car.id) }"
          @click="onRowClick($event, car.id)"
        >
          <td :data-label="t('app.fleet.table.vehicle')">
            <div class="ft__vehicle">
              <span class="ft__vehicle-icon" aria-hidden="true">
                <AppIcon name="car" :size="20" />
              </span>
              <NuxtLink :to="detailPath(car.id)" class="ft__vehicle-model">
                {{ car.model || t('app.fleet.table.unknownModel') }}
              </NuxtLink>
            </div>
          </td>

          <td :data-label="t('app.fleet.table.plate')">
            <span v-if="car.plateNumber" class="ft__plate">{{ car.plateNumber }}</span>
            <span v-else class="ft__empty">—</span>
          </td>

          <td :data-label="t('app.fleet.table.vin')">
            <span v-if="car.vin" class="ft__vin">{{ car.vin }}</span>
            <span v-else class="ft__empty">—</span>
          </td>

          <td :data-label="t('app.fleet.table.driver')">
            <span :class="car.driver ? 'ft__driver' : 'ft__empty'">{{ driverName(car) }}</span>
          </td>

          <td :data-label="t('app.fleet.table.inspection')">
            <div class="ft__compliance">
              <span class="ft__date">{{ formatDate(car.inspectionValidUntil) }}</span>
              <span class="ft__status" :data-tone="inspection.tone">
                <AppIcon v-if="inspection.isAlert" name="alert" :size="13" class="ft__status-glyph" />
                <span v-else class="ft__dot" aria-hidden="true" />
                {{ inspection.label }}
              </span>
            </div>
          </td>

          <td :data-label="t('app.fleet.table.insurance')">
            <div class="ft__compliance">
              <span class="ft__date">{{ formatDate(car.insuranceValidUntil) }}</span>
              <span class="ft__status" :data-tone="insurance.tone">
                <AppIcon v-if="insurance.isAlert" name="alert" :size="13" class="ft__status-glyph" />
                <span v-else class="ft__dot" aria-hidden="true" />
                {{ insurance.label }}
              </span>
            </div>
          </td>

          <td class="ft__go" :data-label="t('app.fleet.table.open')">
            <span class="ft__go-chevron" aria-hidden="true">
              <AppIcon name="chevron-right" :size="18" />
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.ft__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.ft {
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-lg);
  background: var(--color-bg);
  overflow: hidden;
}

.ft__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;
}

.ft__table thead th {
  padding: 0.75rem var(--space-4);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-outline);
  text-align: left;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
  white-space: nowrap;
}

.ft__row {
  transition: background-color var(--duration-fast) var(--ease-out);
}

.ft__row:not(:last-child) td {
  border-bottom: 1px solid var(--color-surface-mid);
}

.ft__row:hover td {
  background: var(--color-surface);
}

.ft__table td {
  padding: 0.875rem var(--space-4);
  color: var(--color-ink);
  vertical-align: middle;
}

/* New-row highlight after creation. */
.ft__row--new td {
  animation: ft-flash 2.4s var(--ease-out);
}

/* ── Vehicle cell ─────────────────────────────────────────── */
.ft__vehicle {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.ft__vehicle-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  background: var(--color-surface-mid);
  color: var(--color-primary);
}

.ft__vehicle-model {
  font-weight: 600;
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color var(--duration-fast) var(--ease-out);
}

.ft__row--link {
  cursor: pointer;
}

.ft__row--link:hover .ft__vehicle-model {
  color: var(--color-primary);
}

.ft__vehicle-model:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}

/* ── Open affordance ──────────────────────────────────────── */
.ft__go {
  width: 1px;
  white-space: nowrap;
  text-align: right;
}

.ft__go-chevron {
  display: inline-flex;
  color: var(--color-muted);
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.ft__row--link:hover .ft__go-chevron,
.ft__row--link:focus-within .ft__go-chevron {
  opacity: 1;
  transform: translateX(0);
  color: var(--color-primary);
}

/* ── Plate / VIN ──────────────────────────────────────────── */
.ft__plate {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 0.8125rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  color: var(--color-ink);
  white-space: nowrap;
}

.ft__vin {
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  color: var(--color-muted);
}

.ft__driver {
  color: var(--color-ink);
}

.ft__empty {
  color: var(--color-muted);
  opacity: 0.7;
}

/* ── Compliance cell ──────────────────────────────────────── */
.ft__compliance {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.ft__date {
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
  white-space: nowrap;
}

.ft__status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.ft__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: currentColor;
  flex: 0 0 6px;
}

/* Alert glyph replaces the dot on urgent/overdue — severity reads without colour. */
.ft__status-glyph {
  flex: 0 0 auto;
  margin: -1px 0;
}

.ft__status[data-tone='ok'] { color: var(--color-comply); }
.ft__status[data-tone='soon'] { color: var(--color-warn-text); }
.ft__status[data-tone='urgent'] { color: var(--color-risk); font-weight: 600; }
.ft__status[data-tone='overdue'] { color: var(--color-risk); font-weight: 600; }
.ft__status[data-tone='missing'] { color: var(--color-muted); }

@keyframes ft-flash {
  0%, 18% { background: var(--color-primary-subtle); }
  100% { background: transparent; }
}

/* ── Responsive: cards under 720px ────────────────────────── */
@media (max-width: 720px) {
  .ft {
    border: none;
    background: transparent;
    overflow: visible;
  }

  .ft__table,
  .ft__table tbody,
  .ft__table tr,
  .ft__table td {
    display: block;
    width: 100%;
  }

  .ft__table thead {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }

  .ft__row {
    margin-bottom: var(--space-3);
    border: 1px solid var(--color-outline);
    border-radius: var(--radius-lg);
    background: var(--color-bg);
    overflow: hidden;
  }

  .ft__row:not(:last-child) td,
  .ft__row td {
    border-bottom: 1px solid var(--color-surface-mid);
  }

  .ft__row td:last-child {
    border-bottom: none;
  }

  .ft__row:hover td {
    background: transparent;
  }

  .ft__table td {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: 0.7rem var(--space-4);
  }

  /* Vehicle becomes the card header. */
  .ft__table td:first-child {
    background: var(--color-surface);
    padding: 0.85rem var(--space-4);
  }

  .ft__table td:not(:first-child)::before {
    content: attr(data-label);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-muted);
    flex: 0 0 auto;
  }

  .ft__compliance {
    align-items: flex-end;
    text-align: right;
  }

  /* The whole card is tappable on touch — drop the dedicated open cell. */
  .ft__go {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ft__row--new td {
    animation: none;
  }
}
</style>
