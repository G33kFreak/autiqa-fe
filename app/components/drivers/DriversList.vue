<script setup lang="ts">
import type { DriverDto } from '#shared/dto/driver.dto';

const props = defineProps<{
  drivers: DriverDto[];
}>();

const emit = defineEmits<{
  addDriver: [];
}>();

const { t } = useI18n();

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function fullName(driver: DriverDto): string {
  return `${driver.firstName} ${driver.lastName}`.trim();
}

function openDriverDetails(driverId: string) {
  void navigateTo(`/app/drivers/${driverId}`);
}
</script>

<template>
  <section class="drivers-page__list-shell">
    <div class="drivers-page__summary-bar">
      <p class="drivers-page__summary">
        {{ t('appSections.drivers.driverCount', { count: props.drivers.length }) }}
      </p>
      <button
        type="button"
        class="app-btn app-btn--primary app-btn--compact drivers-page__summary-add"
        @click="emit('addDriver')"
      >
        <span class="material-symbols-outlined app-btn__icon" aria-hidden="true">add</span>
        {{ t('appSections.drivers.addDriverCta') }}
      </button>
    </div>

    <div class="app-table-shell drivers-page__table-wrap">
      <table class="app-table drivers-page__table">
        <thead>
          <tr>
            <th>{{ t('appSections.drivers.table.driver') }}</th>
            <th>{{ t('appSections.drivers.table.email') }}</th>
            <th>{{ t('appSections.drivers.table.phone') }}</th>
            <th>{{ t('appSections.drivers.table.createdAt') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="driver in props.drivers"
            :key="driver.id"
            class="app-table__row-clickable drivers-page__row-clickable"
            role="link"
            tabindex="0"
            @click="openDriverDetails(driver.id)"
            @keydown.enter="openDriverDetails(driver.id)"
          >
            <td>
              <div class="drivers-page__driver">
                <div class="drivers-page__driver-icon" aria-hidden="true">
                  <span class="material-symbols-outlined">person</span>
                </div>
                <div class="drivers-page__driver-copy">
                  <p class="drivers-page__driver-name">{{ fullName(driver) }}</p>
                </div>
              </div>
            </td>
            <td>
              <span :class="{ 'drivers-page__muted': !driver.email }">
                {{ driver.email || '—' }}
              </span>
            </td>
            <td>
              <span :class="{ 'drivers-page__muted': !driver.phoneNumber }">
                {{ driver.phoneNumber || '—' }}
              </span>
            </td>
            <td>
              <span>{{ formatDate(driver.createdAt) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.drivers-page__summary {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-on-surface-variant);
}

.drivers-page__list-shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.drivers-page__summary-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.drivers-page__table {
  min-width: 52rem;
}

.drivers-page__table tbody td {
  color: var(--color-on-surface);
}

.drivers-page__driver {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.drivers-page__driver-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.65rem;
  background: color-mix(in srgb, var(--color-secondary) 12%, var(--color-surface-container));
  color: var(--color-secondary);
}

.drivers-page__driver-name {
  margin: 0;
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 700;
}

.drivers-page__muted {
  color: var(--color-on-surface-variant);
}
</style>
