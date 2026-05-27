<script setup lang="ts">
const { t } = useI18n();
defineProps<{
  carId: string | null;
  carModel?: string | null;
  carPlateNumber?: string | null;
}>();
</script>

<template>
  <article class="driver-card driver-card--assignment">
    <header class="driver-card__header">
      <h2 class="driver-card__title">
        <span class="driver-card__title-icon" aria-hidden="true">
          <span class="material-symbols-outlined">directions_car</span>
        </span>
        {{ t('appSections.drivers.details.assignment.title') }}
      </h2>
    </header>

    <div
      class="driver-assignment__vehicle"
      :class="{ 'driver-assignment__vehicle--empty': !carId }"
    >
      <div class="driver-assignment__icon-shell" aria-hidden="true">
        <span class="material-symbols-outlined">directions_car</span>
      </div>
      <div class="driver-assignment__content">
        <template v-if="carId">
          <p class="driver-assignment__model">
            {{ carModel || t('appSections.drivers.details.assignment.assignedVehicleFallback') }}
          </p>
          <p
            class="driver-assignment__plate-chip"
            :class="{ 'driver-assignment__plate-chip--empty': !carPlateNumber }"
          >
            {{ carPlateNumber || t('appSections.drivers.details.assignment.plateUnavailable') }}
          </p>
        </template>
        <p v-else class="driver-assignment__empty-title">
          {{ t('appSections.drivers.details.assignment.empty') }}
        </p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.driver-card {
  border-radius: var(--app-radius-card, 1rem);
  padding: 1.35rem;
  background: var(--color-surface-container-lowest);
  box-shadow: var(--shadow-ambient);
}

.driver-card--assignment {
  background: color-mix(
    in srgb,
    var(--color-secondary-fixed) 10%,
    var(--color-surface-container-lowest)
  );
}

.driver-card__header {
  margin-bottom: 0.9rem;
}

.driver-card__title {
  margin: 0;
  color: var(--color-on-surface);
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.driver-card__title-icon {
  flex-shrink: 0;
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 0.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--color-secondary-fixed) 72%, var(--color-surface-container-lowest));
  color: var(--color-secondary);
}

.driver-card__title-icon .material-symbols-outlined {
  font-size: 1.2rem;
  font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}

.driver-assignment__vehicle {
  border-radius: 0.85rem;
  background: var(--color-surface-container-low);
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-height: 4.5rem;
}

.driver-assignment__vehicle--empty {
  background: color-mix(in srgb, var(--color-surface-container-low) 80%, transparent);
}

.driver-assignment__icon-shell {
  flex-shrink: 0;
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 0.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--color-secondary-fixed) 65%, var(--color-surface-container-lowest));
  color: var(--color-secondary);
}

.driver-assignment__icon-shell .material-symbols-outlined {
  font-size: 1.2rem;
  font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
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
  letter-spacing: -0.02em;
}

.driver-assignment__plate-chip {
  margin: 0.45rem 0 0;
  display: inline-flex;
  align-items: center;
  border-radius: 0.5rem;
  padding: 0.25rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--color-surface-container-high);
  color: var(--color-on-surface);
}

.driver-assignment__plate-chip--empty {
  color: var(--color-on-surface-variant);
}

.driver-assignment__empty-title {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
  font-weight: 600;
}
</style>
