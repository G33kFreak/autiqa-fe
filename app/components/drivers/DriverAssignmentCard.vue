<script setup lang="ts">
defineProps<{
  carId: string | null;
  carModel?: string | null;
  carPlateNumber?: string | null;
}>();
</script>

<template>
  <article class="driver-card driver-card--glass">
    <header class="driver-card__header">
      <h2 class="driver-card__title">Assigned car</h2>
    </header>

    <div v-if="carId" class="driver-assignment__vehicle">
      <div class="driver-assignment__accent" aria-hidden="true" />
      <div class="driver-assignment__icon-shell" aria-hidden="true">
        <span class="material-symbols-outlined">directions_car</span>
      </div>
      <div class="driver-assignment__content">
        <p class="driver-assignment__model">{{ carModel || 'Assigned vehicle' }}</p>
        <p
          class="driver-assignment__plate-chip"
          :class="{ 'driver-assignment__plate-chip--empty': !carPlateNumber }"
        >
          {{ carPlateNumber || 'Plate not available' }}
        </p>
      </div>
    </div>
    <div v-else class="driver-assignment__vehicle driver-assignment__vehicle--empty">
      <div class="driver-assignment__accent" aria-hidden="true" />
      <div class="driver-assignment__icon-shell" aria-hidden="true">
        <span class="material-symbols-outlined">directions_car</span>
      </div>
      <div class="driver-assignment__content">
        <p class="driver-assignment__empty-title">No car assigned</p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.driver-card {
  border-radius: 1rem;
  padding: 1.4rem;
  background: var(--color-surface-container-low);
  position: relative;
  overflow: hidden;
}

.driver-card--glass {
  background: color-mix(in srgb, var(--color-secondary-container) 10%, var(--color-surface-container-low));
}

.driver-card__header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
}

.driver-card__title {
  margin: 0;
  color: var(--color-on-surface);
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.driver-assignment__vehicle {
  border-radius: 0.95rem;
  background: var(--color-surface-container-lowest);
  padding: 0.95rem;
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  gap: 0.75rem;
  align-items: center;
  min-height: 4.8rem;
}

.driver-assignment__accent {
  width: 0.25rem;
  align-self: stretch;
  border-radius: 0.35rem;
  background: var(--color-secondary);
}

.driver-assignment__icon-shell {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--color-secondary-fixed) 52%, transparent);
  color: var(--color-secondary-container);
}

.driver-assignment__icon-shell :deep(.material-symbols-outlined) {
  font-size: 1.15rem;
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 20;
}

.driver-assignment__content {
  min-width: 0;
}

.driver-assignment__model {
  margin: 0;
  color: var(--color-on-surface);
  font-weight: 800;
  font-family: var(--font-display);
  font-size: 1.05rem;
  line-height: 1.18;
  letter-spacing: -0.01em;
}

.driver-assignment__plate-chip {
  margin: 0.55rem 0 0;
  display: inline-flex;
  align-items: center;
  border-radius: 8px;
  padding: 0.3rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--color-surface-container-high);
  color: var(--color-on-surface);
}

.driver-assignment__plate-chip--empty {
  color: var(--color-on-surface-variant);
}

.driver-assignment__vehicle--empty {
  background: color-mix(in srgb, var(--color-surface-container-lowest) 78%, transparent);
}

.driver-assignment__empty-title {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
  font-weight: 600;
}
</style>
