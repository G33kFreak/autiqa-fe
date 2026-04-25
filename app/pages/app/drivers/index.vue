<script setup lang="ts">
import AddDriverDialog from '~/components/drivers/AddDriverDialog.vue';
import DriversList from '~/components/drivers/DriversList.vue';
import PageEmptyState from '~/components/shared/PageEmptyState.vue';
import PageStateLoader from '~/components/shared/PageStateLoader.vue';

const { t } = useI18n();
const driversStore = useDriversStore();
const searchInput = ref('');
let searchTimer: ReturnType<typeof setTimeout> | null = null;

const showEmpty = computed(
  () => !driversStore.loading && driversStore.items.length === 0,
);
const showInitialLoading = computed(
  () => driversStore.loading && driversStore.items.length === 0,
);
const showDriversList = computed(
  () => driversStore.items.length > 0,
);
const addDriverDialog = ref<InstanceType<typeof AddDriverDialog> | null>(null);

function openAddDriver() {
  addDriverDialog.value?.showModal();
}

useSeoMeta({
  title: computed(() => t('appSections.drivers.title')),
  description: computed(() => t('appSections.drivers.lead')),
});

onMounted(async () => {
  await driversStore.getViewModel();
});

watch(searchInput, (value) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    void driversStore.fetchDrivers({
      page: 1,
      search: value.trim(),
    });
  }, 450);
});
</script>

<template>
  <div class="drivers-page">
    <template v-if="!showEmpty">
      <h1 class="app-page__title">{{ t('appSections.drivers.title') }}</h1>
      <p class="app-page__lead">{{ t('appSections.drivers.lead') }}</p>
      <label class="drivers-page__search">
        <span class="material-symbols-outlined drivers-page__search-icon" aria-hidden="true">search</span>
        <input
          v-model="searchInput"
          class="ti-input drivers-page__search-input"
          type="text"
          :placeholder="t('appSections.drivers.searchPlaceholder')"
        >
      </label>
    </template>

    <PageStateLoader
      v-if="showInitialLoading"
      :text="t('appSections.drivers.loading')"
    />

    <PageEmptyState
      v-else-if="showEmpty"
      icon="person"
      badge-icon="add"
      :title="t('appSections.drivers.emptyTitle')"
      :subtitle="t('appSections.drivers.emptyBody')"
      :primary-cta-label="t('appSections.drivers.emptyCta')"
      primary-cta-icon="person_add"
      @primary="openAddDriver"
    />
    <DriversList
      v-else-if="showDriversList"
      :drivers="driversStore.items"
      @add-driver="openAddDriver"
    />
    <AddDriverDialog ref="addDriverDialog" />
  </div>
</template>

<style scoped>
.drivers-page__search {
  margin-bottom: 0.9rem;
  width: min(26rem, 100%);
  position: relative;
  display: block;
}

.drivers-page__search-icon {
  position: absolute;
  left: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-outline);
  font-size: 1.05rem;
  pointer-events: none;
}

.drivers-page__search-input {
  padding-left: 2.2rem;
}
</style>
