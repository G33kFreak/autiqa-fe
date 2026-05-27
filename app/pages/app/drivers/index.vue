<script setup lang="ts">
import AddDriverDialog from '~/components/drivers/AddDriverDialog.vue';
import DriversList from '~/components/drivers/DriversList.vue';
import PageEmptyState from '~/components/shared/PageEmptyState.vue';
import PageStateLoader from '~/components/shared/PageStateLoader.vue';

const { t } = useI18n();
const driversStore = useDriversStore();
const searchInput = ref('');
let searchTimer: ReturnType<typeof setTimeout> | null = null;

const showListError = computed(() => driversStore.listError != null);

const showEmpty = computed(
  () =>
    driversStore.listResolved &&
    !driversStore.loading &&
    driversStore.items.length === 0,
);
const showInitialLoading = computed(
  () =>
    !showListError.value &&
    (!driversStore.listResolved ||
      (driversStore.loading && driversStore.items.length === 0)),
);
const showDriversList = computed(
  () => driversStore.listResolved && driversStore.items.length > 0,
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
  try {
    await driversStore.fetchDrivers();
  } catch {
    /* listError set in store */
  }
});

watch(searchInput, (value) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    void driversStore
      .fetchDrivers({
        page: 1,
        search: value.trim(),
      })
      .catch(() => {
        /* listError set in store */
      });
  }, 450);
});
</script>

<template>
  <div class="drivers-page app-page">
    <template v-if="!showEmpty && !showListError">
      <AppPageHeader
        :title="t('appSections.drivers.title')"
        :lead="t('appSections.drivers.lead')"
      />
      <div class="app-toolbar">
        <label class="app-search">
          <span class="material-symbols-outlined app-search__icon" aria-hidden="true">search</span>
          <input
            v-model="searchInput"
            class="ti-input app-search__input"
            type="search"
            :placeholder="t('appSections.drivers.searchPlaceholder')"
          >
        </label>
      </div>
    </template>

    <PageStateLoader
      v-if="showInitialLoading"
      :text="t('appSections.drivers.loading')"
    />

    <p
      v-else-if="showListError"
      class="drivers-page__load-error"
      role="alert"
    >
      {{ t('common.loadError') }}
    </p>

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
.drivers-page__load-error {
  margin: 0;
  padding: 0.85rem 1rem;
  border-radius: 0.5rem;
  color: var(--color-on-error-container);
  background: var(--color-error-container);
}
</style>
