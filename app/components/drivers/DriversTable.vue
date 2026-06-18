<script setup lang="ts">
import type { DriverDto } from '#shared/dto/driver.dto';

const props = defineProps<{
  drivers: DriverDto[];
  /** Ids of just-created drivers, briefly highlighted so they're easy to spot. */
  highlightedIds?: Set<string>;
}>();

const { t } = useI18n();

function fullName(driver: DriverDto): string {
  return `${driver.firstName} ${driver.lastName}`.trim();
}

/** Up to two initials for the monogram — first + last where available. */
function initials(driver: DriverDto): string {
  const first = driver.firstName?.trim()?.[0] ?? '';
  const last = driver.lastName?.trim()?.[0] ?? '';
  return (first + last || first || '?').toUpperCase();
}

/**
 * Deterministic hue from the name so each driver keeps a stable accent across
 * renders — gives the roster visual rhythm without hard-coding per-row colour.
 */
function avatarHue(driver: DriverDto): number {
  const seed = fullName(driver) || driver.id;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  }
  return hash;
}

interface DriverRow {
  driver: DriverDto;
  name: string;
  initials: string;
  hue: number;
  assigned: boolean;
}

const rows = computed<DriverRow[]>(() =>
  props.drivers.map((driver) => ({
    driver,
    name: fullName(driver),
    initials: initials(driver),
    hue: avatarHue(driver),
    assigned: driver.carId !== null,
  })),
);

function isHighlighted(id: string): boolean {
  return props.highlightedIds?.has(id) ?? false;
}
</script>

<template>
  <div class="dt" role="region" :aria-label="t('app.drivers.table.caption')">
    <table class="dt__table">
      <caption class="dt__sr">{{ t('app.drivers.table.caption') }}</caption>
      <thead>
        <tr>
          <th scope="col">{{ t('app.drivers.table.driver') }}</th>
          <th scope="col">{{ t('app.drivers.table.phone') }}</th>
          <th scope="col">{{ t('app.drivers.table.email') }}</th>
          <th scope="col">{{ t('app.drivers.table.status') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.driver.id"
          class="dt__row"
          :class="{ 'dt__row--new': isHighlighted(row.driver.id) }"
        >
          <td :data-label="t('app.drivers.table.driver')">
            <div class="dt__driver">
              <span
                class="dt__avatar"
                aria-hidden="true"
                :style="{
                  '--avatar-hue': row.hue,
                }"
              >{{ row.initials }}</span>
              <span class="dt__name">
                {{ row.name || t('app.drivers.table.unnamed') }}
              </span>
            </div>
          </td>

          <td :data-label="t('app.drivers.table.phone')">
            <a
              v-if="row.driver.phoneNumber"
              class="dt__contact"
              :href="`tel:${row.driver.phoneNumber}`"
            >
              <AppIcon name="phone" :size="15" class="dt__contact-icon" />
              <span class="dt__contact-text">{{ row.driver.phoneNumber }}</span>
            </a>
            <span v-else class="dt__empty">—</span>
          </td>

          <td :data-label="t('app.drivers.table.email')">
            <a
              v-if="row.driver.email"
              class="dt__contact"
              :href="`mailto:${row.driver.email}`"
            >
              <AppIcon name="mail" :size="15" class="dt__contact-icon" />
              <span class="dt__contact-text">{{ row.driver.email }}</span>
            </a>
            <span v-else class="dt__empty">—</span>
          </td>

          <td :data-label="t('app.drivers.table.status')">
            <span class="dt__status" :data-assigned="row.assigned">
              <AppIcon :name="row.assigned ? 'car' : 'circle'" :size="14" class="dt__status-glyph" />
              {{ row.assigned ? t('app.drivers.status.assigned') : t('app.drivers.status.available') }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.dt__sr {
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

.dt {
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-lg);
  background: var(--color-bg);
  overflow: hidden;
}

.dt__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;
}

.dt__table thead th {
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

.dt__row {
  transition: background-color var(--duration-fast) var(--ease-out);
}

.dt__row:not(:last-child) td {
  border-bottom: 1px solid var(--color-surface-mid);
}

.dt__row:hover td {
  background: var(--color-surface);
}

.dt__table td {
  padding: 0.875rem var(--space-4);
  color: var(--color-ink);
  vertical-align: middle;
}

/* New-row highlight after creation. */
.dt__row--new td {
  animation: dt-flash 2.4s var(--ease-out);
}

/* ── Driver identity cell ─────────────────────────────────── */
.dt__driver {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.dt__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-full);
  background: oklch(0.94 0.04 var(--avatar-hue));
  color: oklch(0.42 0.11 var(--avatar-hue));
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  user-select: none;
}

.dt__name {
  font-weight: 600;
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Contact cells ────────────────────────────────────────── */
.dt__contact {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  max-width: 100%;
  color: var(--color-ink);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: color var(--duration-fast) var(--ease-out);
}

.dt__contact-icon {
  flex: 0 0 auto;
  color: var(--color-muted);
  transition: color var(--duration-fast) var(--ease-out);
}

.dt__contact-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.dt__contact:hover {
  color: var(--color-primary);
}

.dt__contact:hover .dt__contact-icon {
  color: var(--color-primary);
}

.dt__contact:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.dt__empty {
  color: var(--color-muted);
  opacity: 0.7;
}

/* ── Status chip ──────────────────────────────────────────── */
.dt__status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.dt__status-glyph {
  flex: 0 0 auto;
}

.dt__status[data-assigned='true'] {
  background: var(--color-comply-bg);
  color: var(--color-comply);
}

.dt__status[data-assigned='false'] {
  background: var(--color-surface-mid);
  color: var(--color-muted);
}

@keyframes dt-flash {
  0%, 18% { background: var(--color-primary-subtle); }
  100% { background: transparent; }
}

/* ── Responsive: cards under 720px ────────────────────────── */
@media (max-width: 720px) {
  .dt {
    border: none;
    background: transparent;
    overflow: visible;
  }

  .dt__table,
  .dt__table tbody,
  .dt__table tr,
  .dt__table td {
    display: block;
    width: 100%;
  }

  .dt__table thead {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }

  .dt__row {
    margin-bottom: var(--space-3);
    border: 1px solid var(--color-outline);
    border-radius: var(--radius-lg);
    background: var(--color-bg);
    overflow: hidden;
  }

  .dt__row:not(:last-child) td,
  .dt__row td {
    border-bottom: 1px solid var(--color-surface-mid);
  }

  .dt__row td:last-child {
    border-bottom: none;
  }

  .dt__row:hover td {
    background: transparent;
  }

  .dt__table td {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: 0.7rem var(--space-4);
  }

  /* Driver becomes the card header. */
  .dt__table td:first-child {
    background: var(--color-surface);
    padding: 0.85rem var(--space-4);
  }

  .dt__table td:not(:first-child)::before {
    content: attr(data-label);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-muted);
    flex: 0 0 auto;
  }

  /* Contact links right-align under their label, ellipsis if long. */
  .dt__contact {
    min-width: 0;
    justify-content: flex-end;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dt__row--new td {
    animation: none;
  }
}
</style>
