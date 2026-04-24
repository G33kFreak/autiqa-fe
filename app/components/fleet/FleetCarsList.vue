<script setup lang="ts">
import type { CarDto } from '#shared/dto/car.dto';

const props = defineProps<{
  cars: CarDto[];
}>();

const emit = defineEmits<{
  addVehicle: [];
}>();

const { t } = useI18n();

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function inspectionDaysLeft(value: string | null): number | null {
  if (!value) return null;
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.ceil((startOfTarget.getTime() - startOfToday.getTime()) / msPerDay);
  return Math.max(diffDays, 0);
}

function driverName(car: CarDto): string {
  if (!car.driver) return t('appSections.fleet.driverUnassigned');
  return `${car.driver.firstName} ${car.driver.lastName}`.trim();
}

function openCarDetails(carId: string) {
  void navigateTo(`/app/fleet/${carId}`);
}
</script>

<template>
  <section class="fleet-page__list-shell">
    <div class="fleet-page__summary-bar">
      <p class="fleet-page__summary">
        {{ t('appSections.fleet.fleetCount', { count: props.cars.length }) }}
      </p>
      <button
        type="button"
        class="fleet-page__cta fleet-page__cta--primary fleet-page__summary-add"
        @click="emit('addVehicle')"
      >
        <span class="material-symbols-outlined fleet-page__cta-icon" aria-hidden="true">add</span>
        {{ t('appSections.fleet.addVehicleCta') }}
      </button>
    </div>

    <div class="fleet-page__table-wrap">
      <table class="fleet-page__table">
        <thead>
          <tr>
            <th>{{ t('appSections.fleet.table.vehicleUnit') }}</th>
            <th>{{ t('appSections.fleet.table.plate') }}</th>
            <th>{{ t('appSections.fleet.table.vin') }}</th>
            <th>{{ t('appSections.fleet.table.assignedDriver') }}</th>
            <th>{{ t('appSections.fleet.table.inspectionValidUntil') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="car in props.cars"
            :key="car.id"
            class="fleet-page__row-clickable"
            role="link"
            tabindex="0"
            @click="openCarDetails(car.id)"
            @keydown.enter="openCarDetails(car.id)"
          >
            <td>
              <div class="fleet-page__vehicle">
                <div class="fleet-page__vehicle-icon" aria-hidden="true">
                  <span class="material-symbols-outlined">directions_car</span>
                </div>
                <div class="fleet-page__vehicle-copy">
                  <p class="fleet-page__vehicle-model">
                    {{ car.model || t('appSections.fleet.unknownModel') }}
                  </p>
                </div>
              </div>
            </td>
            <td>
              <span
                class="fleet-page__plate-chip"
                :class="{ 'fleet-page__plate-chip--empty': !car.plateNumber }"
              >
                {{ car.plateNumber || '—' }}
              </span>
            </td>
            <td>
              <span class="fleet-page__mono">{{ car.vin || '—' }}</span>
            </td>
            <td>
              <span
                class="fleet-page__driver"
                :class="{ 'fleet-page__driver--muted': !car.driver }"
              >
                {{ driverName(car) }}
              </span>
            </td>
            <td>
              <span
                class="fleet-page__inspection"
                :class="{ 'fleet-page__inspection--muted': !car.inspectionValidUntil }"
              >
                {{ formatDate(car.inspectionValidUntil) }}
                <span
                  v-if="inspectionDaysLeft(car.inspectionValidUntil) !== null"
                  class="fleet-page__inspection-days-left"
                  :class="{
                    'fleet-page__inspection-days-left--ok':
                      inspectionDaysLeft(car.inspectionValidUntil)! > 30,
                    'fleet-page__inspection-days-left--warning':
                      inspectionDaysLeft(car.inspectionValidUntil)! <= 30,
                  }"
                >
                  {{
                    t('appSections.fleet.inspectionDaysLeft', {
                      count: inspectionDaysLeft(car.inspectionValidUntil),
                    })
                  }}
                </span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.fleet-page__summary {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-on-surface-variant);
}

.fleet-page__list-shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fleet-page__summary-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.fleet-page__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    opacity 0.18s ease,
    transform 0.18s ease,
    background 0.18s ease;
}

.fleet-page__cta--primary {
  color: var(--color-on-secondary);
  background: linear-gradient(
    135deg,
    var(--color-secondary) 0%,
    var(--color-secondary-container) 100%
  );
  box-shadow:
    0 4px 16px color-mix(in srgb, var(--color-secondary-container) 28%, transparent),
    0 12px 32px color-mix(in srgb, var(--color-secondary) 12%, transparent);
}

.fleet-page__cta--primary:hover:not(:disabled) {
  opacity: 0.96;
  transform: translateY(-1px);
  box-shadow:
    0 6px 22px color-mix(in srgb, var(--color-secondary-container) 32%, transparent),
    0 14px 36px color-mix(in srgb, var(--color-secondary) 14%, transparent);
}

.fleet-page__cta:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  outline-offset: 3px;
}

.fleet-page__cta-icon {
  font-size: 1.25rem;
}

.fleet-page__cta--primary .fleet-page__cta-icon {
  font-variation-settings:
    'FILL' 1,
    'wght' 500,
    'GRAD' 0,
    'opsz' 24;
}

.fleet-page__summary-add {
  padding: 0.625rem 1rem;
  font-size: 0.8125rem;
}

.fleet-page__table-wrap {
  overflow-x: auto;
  border-radius: 0.875rem;
  background: var(--color-surface-container-low);
  box-shadow: var(--shadow-ambient);
}

.fleet-page__table {
  width: 100%;
  border-collapse: collapse;
  min-width: 52rem;
}

.fleet-page__table thead th {
  padding: 0.9rem 1rem;
  text-align: left;
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
  background: var(--color-surface-container);
}

.fleet-page__table tbody tr {
  background: var(--color-surface-container-lowest);
  transition: background 0.18s ease;
}

.fleet-page__table tbody tr:hover {
  background: var(--color-surface-container);
}

.fleet-page__row-clickable {
  cursor: pointer;
}

.fleet-page__table tbody td {
  padding: 1rem;
  vertical-align: middle;
}

.fleet-page__vehicle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.fleet-page__vehicle-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.65rem;
  background: color-mix(in srgb, var(--color-secondary) 12%, var(--color-surface-container));
  color: var(--color-secondary);
}

.fleet-page__vehicle-icon .material-symbols-outlined {
  font-size: 1.15rem;
}

.fleet-page__vehicle-copy {
  min-width: 0;
}

.fleet-page__vehicle-model {
  margin: 0;
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-on-surface);
}

.fleet-page__mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-on-surface);
}

.fleet-page__plate-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 4.5rem;
  padding: 0.3rem 0.65rem;
  border-radius: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-secondary-container);
  background: var(--color-secondary-fixed);
}

.fleet-page__plate-chip--empty {
  min-width: unset;
  padding: 0.3rem 0.55rem;
  font-weight: 600;
  letter-spacing: normal;
  text-transform: none;
  color: var(--color-on-surface-variant);
  background: var(--color-surface-container-high);
}

.fleet-page__driver,
.fleet-page__inspection {
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-on-surface);
}

.fleet-page__driver--muted,
.fleet-page__inspection--muted {
  color: var(--color-on-surface-variant);
  font-weight: 500;
}

.fleet-page__inspection-days-left {
  margin-left: 0.35rem;
}

.fleet-page__inspection-days-left--ok {
  color: var(--color-primary);
}

.fleet-page__inspection-days-left--warning {
  color: var(--color-error);
}
</style>
