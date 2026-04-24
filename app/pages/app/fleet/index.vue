<script setup lang="ts">
import AddVehicleDialog from '~/components/fleet/AddVehicleDialog.vue';
import FleetCarsList from '~/components/fleet/FleetCarsList.vue';
import PageEmptyState from '~/components/shared/PageEmptyState.vue';
import PageStateLoader from '~/components/shared/PageStateLoader.vue';

const { t } = useI18n();
const carsStore = useCarsStore();

const addVehicleDialog = ref<InstanceType<typeof AddVehicleDialog> | null>(null);

const showEmpty = computed(
  () =>
    carsStore.listResolved &&
    !carsStore.loading &&
    carsStore.items.length === 0,
);

const showInitialLoading = computed(
  () =>
    !carsStore.listResolved ||
    (carsStore.loading && carsStore.items.length === 0),
);

const showFleetSummary = computed(
  () => carsStore.listResolved && carsStore.items.length > 0,
);

useSeoMeta({
  title: computed(() => t('appSections.fleet.title')),
  description: computed(() => t('appSections.fleet.lead')),
});

onMounted(async () => {
  await carsStore.getViewModel();
});

function openAddVehicle() {
  addVehicleDialog.value?.showModal();
}
</script>

<template>
  <div class="fleet-page">
    <template v-if="!showEmpty">
      <h1 class="app-page__title">{{ t('appSections.fleet.title') }}</h1>
      <p class="app-page__lead">{{ t('appSections.fleet.lead') }}</p>
    </template>

    <PageStateLoader
      v-if="showInitialLoading"
      :text="t('appSections.fleet.loading')"
    />

    <PageEmptyState
      v-else-if="showEmpty"
      icon="directions_car"
      badge-icon="add"
      :title="t('appSections.fleet.emptyTitle')"
      :subtitle="t('appSections.fleet.emptyBody')"
      :primary-cta-label="t('appSections.fleet.emptyCta')"
      primary-cta-icon="add_circle"
      :secondary-cta-label="t('appSections.fleet.importSpreadsheetCta')"
      secondary-cta-icon="upload_file"
      :secondary-title="t('appSections.fleet.importSpreadsheetSoon')"
      :secondary-aria-label="`${t('appSections.fleet.importSpreadsheetCta')} (${t('appSections.fleet.importSpreadsheetSoon')})`"
      secondary-disabled
      @primary="openAddVehicle"
    />

    <FleetCarsList
      v-else-if="showFleetSummary"
      :cars="carsStore.items"
      @add-vehicle="openAddVehicle"
    />

    <AddVehicleDialog ref="addVehicleDialog" />
  </div>
</template>

<style scoped>
</style>
