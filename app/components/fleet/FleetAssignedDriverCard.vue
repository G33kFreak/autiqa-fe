<script setup lang="ts">
const props = defineProps<{
  name: string;
  phone: string;
}>();

const emit = defineEmits<{
  assignOther: [];
  removeDriver: [];
}>();

const { t } = useI18n();
const hasDriver = computed(() => Boolean((props.name || '').trim()));
</script>

<template>
  <article class="compliance-row__small">
    <p class="compliance-row__label">{{ t('appSections.fleet.vehicleDetails.assignedDriver') }}</p>
    <p class="compliance-row__title">
      {{ hasDriver ? name : t('appSections.fleet.driverUnassigned') }}
    </p>
    <p class="compliance-row__description">
      {{ hasDriver ? phone : t('appSections.fleet.vehicleDetails.emptyDriverCopy') }}
    </p>
    <div class="driver-actions">
      <button type="button" class="button button--primary" @click="emit('assignOther')">
        {{ t('appSections.fleet.vehicleDetails.assignOther') }}
      </button>
      <button
        v-if="hasDriver"
        type="button"
        class="button button--secondary"
        @click="emit('removeDriver')"
      >
        {{ t('appSections.fleet.vehicleDetails.removeDriver') }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.compliance-row__small {
  border-radius: 0.875rem;
  background: var(--color-surface-container-lowest);
  padding: 0.9rem;
}

.compliance-row__label {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.compliance-row__title {
  margin: 0.4rem 0 0;
  font-size: 1.1rem;
  line-height: 1.2;
  font-weight: 800;
  color: var(--color-on-surface);
}

.compliance-row__description {
  margin: 0.45rem 0 0;
  font-size: 0.875rem;
  line-height: 1.25;
  color: var(--color-on-surface-variant);
}

.driver-actions {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.button {
  border: 0;
  border-radius: 0.6rem;
  padding: 0.35rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, background-color 0.2s ease;
}

.button:hover {
  transform: translateY(-1px);
}

.button--primary {
  background: var(--color-secondary);
  color: var(--color-on-secondary);
}

.button--secondary {
  background: var(--color-surface-container-high);
  color: var(--color-on-surface);
}
</style>
