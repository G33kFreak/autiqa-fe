<script setup lang="ts">
import ListEmptyState from '~/components/shared/ListEmptyState.vue';

defineProps<{
  complianceItems: Array<{
    title: string;
    validUntil: string;
    attachments?: readonly string[];
    icon?: 'verified' | 'shield';
    showEmptyCta?: boolean;
  }>;
  driver: {
    name: string;
    phone: string;
    email?: string;
  };
}>();

const emit = defineEmits<{
  assignOther: [];
  removeDriver: [];
  complianceEmptyCta: [];
}>();

const { t } = useI18n();
</script>

<template>
  <section class="fleet-card compliance-card">
    <div class="fleet-card__header">
      <h2 class="fleet-card__title">{{ t('appSections.fleet.vehicleDetails.complianceStatus') }}</h2>
    </div>
    <div class="compliance-row">
      <template v-if="complianceItems.length > 0">
        <FleetComplianceExpiryItem
          v-for="item in complianceItems"
          :key="item.title"
          :title="item.title"
          :valid-until="item.validUntil"
          :attachments="item.attachments"
          :icon="item.icon"
          :show-empty-cta="item.showEmptyCta ?? true"
          @empty-cta-click="emit('complianceEmptyCta')"
        />
      </template>
      <article v-else class="compliance-empty">
        <ListEmptyState
          icon="verified_user"
          :title="t('appSections.fleet.vehicleDetails.emptyComplianceTitle')"
          :description="t('appSections.fleet.vehicleDetails.emptyComplianceCopy')"
        />
      </article>

      <FleetAssignedDriverCard
        :name="driver.name"
        :phone="driver.phone"
        :email="driver.email ?? ''"
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

.compliance-row {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.compliance-empty {
  margin: 0;
  padding: 0;
  background: transparent;
}

</style>
