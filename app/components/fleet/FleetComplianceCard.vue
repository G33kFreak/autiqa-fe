<script setup lang="ts">
defineProps<{
  complianceItems: Array<{
    title: string;
    validUntil: string;
    attachments?: readonly string[];
  }>;
  driver: {
    name: string;
    phone: string;
  };
}>();

const emit = defineEmits<{
  assignOther: [];
  removeDriver: [];
}>();

const { t } = useI18n();
</script>

<template>
  <section class="fleet-card compliance-card">
    <div class="fleet-card__header">
      <h2 class="fleet-card__title">{{ t('appSections.fleet.vehicleDetails.complianceStatus') }}</h2>
      <span class="compliance-card__icon" aria-hidden="true">✓</span>
    </div>
    <div class="compliance-row">
      <template v-if="complianceItems.length > 0">
        <FleetComplianceExpiryItem
          v-for="item in complianceItems"
          :key="item.title"
          :title="item.title"
          :valid-until="item.validUntil"
          :attachments="item.attachments"
        />
      </template>
      <article v-else class="compliance-empty">
        <p class="compliance-empty__title">{{ t('appSections.fleet.vehicleDetails.emptyComplianceTitle') }}</p>
        <p class="compliance-empty__copy">{{ t('appSections.fleet.vehicleDetails.emptyComplianceCopy') }}</p>
      </article>

      <FleetAssignedDriverCard
        :name="driver.name"
        :phone="driver.phone"
        @assign-other="emit('assignOther')"
        @remove-driver="emit('removeDriver')"
      />
    </div>
  </section>
</template>

<style scoped>
.fleet-card {
  border-radius: 1rem;
  background: var(--color-surface-container-low);
  padding: 1rem 1.125rem 1.1rem;
}

.fleet-card__header {
  margin-bottom: 0.875rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.8rem;
}

.fleet-card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--color-on-surface);
}

.compliance-card {
  padding-bottom: 1rem;
}

.compliance-card__icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 900;
  color: var(--color-on-surface-variant);
  background: var(--color-surface-container-high);
}

.compliance-row {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.compliance-empty {
  border-radius: 0.875rem;
  background: var(--color-surface-container-lowest);
  padding: 0.9rem;
}

.compliance-empty__title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-on-surface);
}

.compliance-empty__copy {
  margin: 0.45rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-on-surface-variant);
}

@media (max-width: 1120px) {
  .compliance-row {
    grid-template-columns: 1fr;
  }
}
</style>
