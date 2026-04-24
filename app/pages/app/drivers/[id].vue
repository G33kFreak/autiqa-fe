<script setup lang="ts">
import type { DriverDto } from '#shared/dto/driver.dto';

const { t } = useI18n();
const route = useRoute();
const driversStore = useDriversStore();

const driverId = computed(() => String(route.params.id || ''));
const detailsLoading = ref(true);
const detailsResolved = ref(false);
const driver = ref<DriverDto | null>(null);

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

const fullName = computed(() => {
  if (!driver.value) return '—';
  return `${driver.value.firstName} ${driver.value.lastName}`.trim();
});

useSeoMeta({
  title: computed(() => `${t('appSections.drivers.title')} #${driverId.value}`),
  description: computed(() => t('appSections.drivers.lead')),
});

onMounted(async () => {
  detailsLoading.value = true;
  try {
    if (!driversStore.items.length) {
      await driversStore.getViewModel();
    }
    driver.value = driversStore.items.find((item) => item.id === driverId.value) ?? null;
  } finally {
    detailsLoading.value = false;
    detailsResolved.value = true;
  }
});
</script>

<template>
  <section class="driver-details-page">
    <div v-if="detailsLoading && !detailsResolved" class="driver-details-page__loading">
      <span class="material-symbols-outlined driver-details-page__spinner" aria-hidden="true">progress_activity</span>
      <p>{{ t('common.loading') }}</p>
    </div>

    <template v-else-if="driver">
      <header class="driver-details-page__header">
        <p class="driver-details-page__overline">{{ t('appSections.drivers.title') }}</p>
        <h1 class="driver-details-page__title">{{ fullName }}</h1>
      </header>

      <section class="driver-details-page__card">
        <dl class="driver-details-page__grid">
          <div>
            <dt>{{ t('appSections.drivers.table.email') }}</dt>
            <dd>{{ driver.email || '—' }}</dd>
          </div>
          <div>
            <dt>{{ t('appSections.drivers.table.phone') }}</dt>
            <dd>{{ driver.phoneNumber || '—' }}</dd>
          </div>
          <div>
            <dt>{{ t('appSections.drivers.table.assignedCarId') }}</dt>
            <dd class="driver-details-page__mono">{{ driver.carId || '—' }}</dd>
          </div>
          <div>
            <dt>{{ t('appSections.drivers.table.createdAt') }}</dt>
            <dd>{{ formatDate(driver.createdAt) }}</dd>
          </div>
        </dl>
      </section>
    </template>

    <section v-else class="driver-details-page__not-found">
      <h2>{{ t('appSections.drivers.driverNotFoundTitle') }}</h2>
      <p>{{ t('appSections.drivers.driverNotFoundBody') }}</p>
    </section>
  </section>
</template>

<style scoped>
.driver-details-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.driver-details-page__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 12rem;
  border-radius: 0.75rem;
  background: var(--color-surface-container-low);
}

.driver-details-page__spinner {
  font-size: 2rem;
  color: var(--color-secondary-container);
  animation: driver-details-spin 0.85s linear infinite;
}

@keyframes driver-details-spin {
  to {
    transform: rotate(360deg);
  }
}

.driver-details-page__header {
  border-radius: 0.9rem;
  padding: 1.1rem 1.2rem;
  background: var(--color-surface-container-low);
}

.driver-details-page__overline {
  margin: 0 0 0.25rem;
  font-size: 0.6875rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.driver-details-page__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--color-on-surface);
}

.driver-details-page__card {
  border-radius: 0.9rem;
  padding: 1.1rem 1.2rem;
  background: var(--color-surface-container-low);
}

.driver-details-page__grid {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.driver-details-page__grid dt {
  margin: 0 0 0.2rem;
  font-size: 0.6875rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.driver-details-page__grid dd {
  margin: 0;
  color: var(--color-on-surface);
}

.driver-details-page__mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
}

.driver-details-page__not-found {
  border-radius: 0.9rem;
  padding: 1.1rem 1.2rem;
  background: var(--color-surface-container-low);
}

.driver-details-page__not-found h2 {
  margin: 0 0 0.5rem;
  font-family: var(--font-display);
  color: var(--color-on-surface);
}

.driver-details-page__not-found p {
  margin: 0;
  color: var(--color-on-surface-variant);
}

@media (max-width: 900px) {
  .driver-details-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
