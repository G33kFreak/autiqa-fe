<script setup lang="ts">
import type { CarDto } from '#shared/dto/car.dto';
import {
  inspectionDaysLeftClamped,
  inspectionExpiryTone,
  isInspectionDueOrExpired,
} from '~/utils/fleet-inspection-expiry';

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

function inspectionCountdownClass(value: string | null) {
  const tone = inspectionExpiryTone(value);
  return {
    'fleet-page__inspection-days-left--ok': tone === 'ok',
    'fleet-page__inspection-days-left--warn': tone === 'warn',
    'fleet-page__inspection-days-left--critical': tone === 'critical',
  };
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
    <AppSection>
      <template #actions>
        <button
          type="button"
          class="app-btn app-btn--primary app-btn--compact"
          @click="emit('addVehicle')"
        >
          <span class="material-symbols-outlined app-btn__icon" aria-hidden="true">add</span>
          {{ t('appSections.fleet.addVehicleCta') }}
        </button>
      </template>
      <p class="fleet-page__summary">
        {{ t('appSections.fleet.fleetCount', { count: props.cars.length }) }}
      </p>
    <div class="app-table-shell fleet-page__table-wrap">
      <table class="app-table fleet-page__table">
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
            class="app-table__row-clickable fleet-page__row-clickable"
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
                  v-if="inspectionDaysLeftClamped(car.inspectionValidUntil) !== null"
                  class="fleet-page__inspection-days-left"
                  :class="inspectionCountdownClass(car.inspectionValidUntil)"
                >
                  {{
                    isInspectionDueOrExpired(car.inspectionValidUntil)
                      ? t('appSections.fleet.complianceExpired')
                      : t('appSections.fleet.inspectionDaysLeft', {
                          count: inspectionDaysLeftClamped(car.inspectionValidUntil),
                        })
                  }}
                </span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </AppSection>
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

.fleet-page__table {
  min-width: 52rem;
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
  display: inline-block;
  margin-left: 0.35rem;
  font-weight: 700;
}

.fleet-page__inspection-days-left--ok {
  color: var(--color-secondary);
}

.fleet-page__inspection-days-left--warn {
  color: #d97706;
}

.fleet-page__inspection-days-left--critical {
  color: var(--color-error);
}
</style>
