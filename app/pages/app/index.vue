<script setup lang="ts">
import AlertsModuleCard from '~/components/dashboard/AlertsModuleCard.vue';
import PageStateLoader from '~/components/shared/PageStateLoader.vue';

const { t, locale } = useI18n();
const localePath = useLocalePath();
const alertsStore = useAlertsStore();
const carsStore = useCarsStore();
const driversStore = useDriversStore();

const overview = computed(() => alertsStore.overview);

const dashboardInitialLoading = ref(true);
const fleetStatsError = ref(false);
const fleetStats = ref({
  totalCars: null as number | null,
  carsWithDriver: null as number | null,
  totalDrivers: null as number | null,
  driversAssigned: null as number | null,
});

async function fetchFleetStats() {
  fleetStatsError.value = false;
  try {
    const [totalCars, carsWithDriver, totalDrivers, driversAssigned] = await Promise.all([
      carsStore.fetchListItemCount(),
      carsStore.fetchListItemCount({ isAssigned: true }),
      driversStore.fetchListItemCount(),
      driversStore.fetchListItemCount({ isAssigned: true }),
    ]);
    fleetStats.value = { totalCars, carsWithDriver, totalDrivers, driversAssigned };
  } catch {
    fleetStatsError.value = true;
  }
}

async function loadDashboardParallel() {
  await Promise.all([
    alertsStore.fetchOverview().catch(() => {
      /* alertsStore.error */
    }),
    fetchFleetStats(),
  ]);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return t('appSections.dashboard.alerts.datePlaceholder');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}.${month}.${year}`;
}

type InspectionTone = 'danger' | 'warning' | 'success' | 'neutral';

function inspectionBadge(validUntil: string | null | undefined): { label: string; tone: InspectionTone } {
  const unknown = t('appSections.dashboard.alerts.badges.unknownDate');
  if (!validUntil) return { label: unknown, tone: 'neutral' };
  const end = new Date(validUntil);
  if (Number.isNaN(end.getTime())) return { label: unknown, tone: 'neutral' };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const diffDays = Math.ceil((target.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) return { label: t('appSections.dashboard.alerts.badges.expired'), tone: 'danger' };
  if (diffDays === 0) return { label: t('appSections.dashboard.alerts.badges.expiresToday'), tone: 'danger' };
  if (diffDays <= 7) {
    return { label: t('appSections.dashboard.alerts.badges.daysLeft', { count: diffDays }), tone: 'danger' };
  }
  if (diffDays <= 30) {
    return { label: t('appSections.dashboard.alerts.badges.daysLeft', { count: diffDays }), tone: 'warning' };
  }
  return { label: t('appSections.dashboard.alerts.badges.daysLeft', { count: diffDays }), tone: 'success' };
}

function inspectionChipIcon(tone: InspectionTone): string | null {
  if (tone === 'warning') return 'warning';
  if (tone === 'danger') return 'error';
  return null;
}

function duesBadge(dueDate: string | null | undefined): { label: string; tone: InspectionTone } {
  const unknown = t('appSections.dashboard.alerts.badges.unknownDate');
  if (!dueDate) return { label: unknown, tone: 'neutral' };
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return { label: unknown, tone: 'neutral' };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.ceil((target.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) return { label: t('appSections.dashboard.alerts.badges.overdue'), tone: 'danger' };
  if (diffDays === 0) return { label: t('appSections.dashboard.alerts.badges.dueToday'), tone: 'danger' };
  if (diffDays <= 7) {
    return { label: t('appSections.dashboard.alerts.badges.daysLeft', { count: diffDays }), tone: 'danger' };
  }
  if (diffDays <= 30) {
    return { label: t('appSections.dashboard.alerts.badges.daysLeft', { count: diffDays }), tone: 'warning' };
  }
  return { label: t('appSections.dashboard.alerts.badges.daysLeft', { count: diffDays }), tone: 'success' };
}

const inspectionWorstTone = computed<InspectionTone>(() => {
  const items = overview.value?.inspectionExpiringSoon.items ?? [];
  if (!items.length) return 'success';

  let hasWarning = false;
  let hasSuccess = false;

  for (const item of items) {
    const tone = inspectionBadge(item.inspectionValidUntil).tone;
    if (tone === 'danger') return 'danger';
    if (tone === 'warning') hasWarning = true;
    if (tone === 'success') hasSuccess = true;
  }

  if (hasWarning) return 'warning';
  if (hasSuccess) return 'success';
  return 'neutral';
});

const insuranceDuesTone = computed<InspectionTone>(() => {
  const items = overview.value?.InsuranceDuesExpiringSoon.items ?? [];
  if (!items.length) return 'success';

  let hasWarning = false;
  let hasSuccess = false;

  for (const item of items) {
    const tone = duesBadge(item.installment.dueDate).tone;
    if (tone === 'danger') return 'danger';
    if (tone === 'warning') hasWarning = true;
    if (tone === 'success') hasSuccess = true;
  }

  if (hasWarning) return 'warning';
  if (hasSuccess) return 'success';
  return 'neutral';
});

const insuranceExpiryTone = computed<InspectionTone>(() => {
  const items = overview.value?.InsuranceExpiringSoon.items ?? [];
  if (!items.length) return 'success';

  let hasWarning = false;
  let hasSuccess = false;

  for (const item of items) {
    const tone = inspectionBadge(item.insurance.coverageEnd).tone;
    if (tone === 'danger') return 'danger';
    if (tone === 'warning') hasWarning = true;
    if (tone === 'success') hasSuccess = true;
  }

  if (hasWarning) return 'warning';
  if (hasSuccess) return 'success';
  return 'neutral';
});

const insuranceExpiryRows = computed(() => {
  void locale.value;
  const items = overview.value?.InsuranceExpiringSoon.items ?? [];
  return items.map((row) => ({
    row,
    badge: inspectionBadge(row.insurance.coverageEnd),
  }));
});

const insuranceDuesRows = computed(() => {
  void locale.value;
  const items = overview.value?.InsuranceDuesExpiringSoon.items ?? [];
  return items.map((row) => ({
    row,
    badge: duesBadge(row.installment.dueDate),
  }));
});

const inspectionRows = computed(() => {
  void locale.value;
  const items = overview.value?.inspectionExpiringSoon.items ?? [];
  return items.map((row) => ({
    row,
    badge: inspectionBadge(row.inspectionValidUntil),
  }));
});

useSeoMeta({
  title: computed(() => t('appSections.dashboard.title')),
  description: computed(() => t('appSections.dashboard.lead')),
});

onMounted(async () => {
  dashboardInitialLoading.value = true;
  try {
    await loadDashboardParallel();
  } finally {
    dashboardInitialLoading.value = false;
  }
});

function fleetCarPath(carId: string) {
  return localePath(`/app/fleet/${carId}`);
}
</script>

<template>
  <PageStateLoader
    v-if="dashboardInitialLoading"
    :text="t('appSections.dashboard.loading')"
    min-height="min(70vh, 28rem)"
  />
  <div v-else class="dash">
    <h1 class="app-page__title">{{ t('appSections.dashboard.title') }}</h1>

    <section class="dash__fleet" :aria-label="t('appSections.dashboard.fleetStats.title')">
      <p v-if="fleetStatsError" class="dash__fleet-error" role="alert">
        {{ t('appSections.dashboard.fleetStats.loadError') }}
      </p>
      <div v-if="fleetStats.totalCars !== null" class="dash__fleet-cards">
        <article class="dash__fleet-card dash__fleet-card--vehicles">
          <div class="dash__fleet-card-accent" aria-hidden="true" />
          <div class="dash__fleet-card-inner">
            <div class="dash__fleet-card-head">
              <span class="material-symbols-outlined dash__fleet-card-icon" aria-hidden="true">directions_car</span>
              <h3 class="dash__fleet-card-title">{{ t('appSections.dashboard.fleetStats.carsTitle') }}</h3>
            </div>
            <div class="dash__fleet-card-metrics">
              <div class="dash__fleet-metric">
                <p class="dash__fleet-metric-label">{{ t('appSections.dashboard.fleetStats.assigned') }}</p>
                <p class="dash__fleet-metric-value">{{ fleetStats.carsWithDriver }}</p>
              </div>
              <div class="dash__fleet-metric-divider" aria-hidden="true" />
              <div class="dash__fleet-metric">
                <p class="dash__fleet-metric-label">{{ t('appSections.dashboard.fleetStats.total') }}</p>
                <p class="dash__fleet-metric-value dash__fleet-metric-value--muted">{{ fleetStats.totalCars }}</p>
              </div>
            </div>
          </div>
        </article>

        <article class="dash__fleet-card dash__fleet-card--drivers">
          <div class="dash__fleet-card-accent dash__fleet-card-accent--drivers" aria-hidden="true" />
          <div class="dash__fleet-card-inner">
            <div class="dash__fleet-card-head">
              <span class="material-symbols-outlined dash__fleet-card-icon" aria-hidden="true">badge</span>
              <h3 class="dash__fleet-card-title">{{ t('appSections.dashboard.fleetStats.driversTitle') }}</h3>
            </div>
            <div class="dash__fleet-card-metrics">
              <div class="dash__fleet-metric">
                <p class="dash__fleet-metric-label">{{ t('appSections.dashboard.fleetStats.assigned') }}</p>
                <p class="dash__fleet-metric-value">{{ fleetStats.driversAssigned }}</p>
              </div>
              <div class="dash__fleet-metric-divider" aria-hidden="true" />
              <div class="dash__fleet-metric">
                <p class="dash__fleet-metric-label">{{ t('appSections.dashboard.fleetStats.total') }}</p>
                <p class="dash__fleet-metric-value dash__fleet-metric-value--muted">{{ fleetStats.totalDrivers }}</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <p v-if="alertsStore.error" class="dash__alerts-state dash__alerts-state--error" role="alert">
      {{ t('appSections.dashboard.alerts.loadError') }}
    </p>

    <section v-if="overview" class="dash__alerts" aria-live="polite">
      <AlertsModuleCard
        :title="t('appSections.dashboard.alerts.dues.title')"
        :subtitle="t('appSections.dashboard.alerts.dues.subtitle')"
        icon="payments"
        :count="overview.InsuranceDuesExpiringSoon.count"
        :tone="insuranceDuesTone"
      >
        <template v-if="overview.InsuranceDuesExpiringSoon.items.length">
          <ul class="dash__alerts-list">
            <li
              v-for="{ row: item, badge } in insuranceDuesRows"
              :key="item.installment.id"
              class="dash__alerts-list-item"
            >
              <NuxtLink
                :to="fleetCarPath(item.car.id)"
                class="dash__alerts-item dash__alerts-item--link"
                :aria-label="t('appSections.dashboard.alerts.openCarDetails', { model: item.car.model })"
              >
                <div class="dash__alerts-item-head">
                  <div class="dash__alerts-item-main">
                    <p class="dash__alerts-item-title">{{ item.car.model }}</p>
                    <p v-if="item.car.plateNumber" class="dash__plate-chip">{{ item.car.plateNumber }}</p>
                  </div>
                  <span
                    class="dash__alerts-chip"
                    :class="`dash__alerts-chip--${badge.tone}`"
                  >
                    <span
                      v-if="inspectionChipIcon(badge.tone)"
                      class="dash__alerts-chip-icon material-symbols-outlined"
                      aria-hidden="true"
                    >
                      {{ inspectionChipIcon(badge.tone) }}
                    </span>
                    {{ badge.label }}
                  </span>
                </div>
                <p class="dash__alerts-item-meta dash__alerts-item-meta--dues">
                  <span>
                    {{ t('appSections.dashboard.alerts.meta.due') }}
                    <span class="dash__alerts-item-meta-date">{{ formatDate(item.installment.dueDate) }}</span>
                  </span>
                  <span class="dash__alerts-item-amount">
                    {{ item.installment.amount }} {{ item.insurance.currency }}
                  </span>
                </p>
              </NuxtLink>
            </li>
          </ul>
          <button type="button" class="dash__card-action">
            {{ t('appSections.dashboard.alerts.dues.cta') }}
          </button>
        </template>
        <template v-else>
          <div class="dash__success-empty">
            <span class="dash__success-icon material-symbols-outlined" aria-hidden="true">
              verified
            </span>
            <p class="dash__success-title">{{ t('appSections.dashboard.alerts.dues.emptyTitle') }}</p>
            <p class="dash__success-copy">{{ t('appSections.dashboard.alerts.dues.emptyCopy') }}</p>
          </div>
        </template>
      </AlertsModuleCard>

      <AlertsModuleCard
        :title="t('appSections.dashboard.alerts.expiry.title')"
        :subtitle="t('appSections.dashboard.alerts.expiry.subtitle')"
        icon="shield"
        :count="overview.InsuranceExpiringSoon.count"
        :tone="insuranceExpiryTone"
      >
        <template v-if="overview.InsuranceExpiringSoon.items.length">
          <ul class="dash__alerts-list">
            <li
              v-for="{ row: item, badge } in insuranceExpiryRows"
              :key="item.insurance.id"
              class="dash__alerts-list-item"
            >
              <NuxtLink
                :to="fleetCarPath(item.car.id)"
                class="dash__alerts-item dash__alerts-item--link"
                :aria-label="t('appSections.dashboard.alerts.openCarDetails', { model: item.car.model })"
              >
                <div class="dash__alerts-item-head">
                  <div class="dash__alerts-item-main">
                    <p class="dash__alerts-item-title">{{ item.car.model }}</p>
                    <p v-if="item.car.plateNumber" class="dash__plate-chip">{{ item.car.plateNumber }}</p>
                  </div>
                  <span
                    class="dash__alerts-chip"
                    :class="`dash__alerts-chip--${badge.tone}`"
                  >
                    <span
                      v-if="inspectionChipIcon(badge.tone)"
                      class="dash__alerts-chip-icon material-symbols-outlined"
                      aria-hidden="true"
                    >
                      {{ inspectionChipIcon(badge.tone) }}
                    </span>
                    {{ badge.label }}
                  </span>
                </div>
                <p class="dash__alerts-item-meta">
                  {{ t('appSections.dashboard.alerts.meta.coverageEnds') }}
                  <span class="dash__alerts-item-meta-date">{{ formatDate(item.insurance.coverageEnd) }}</span>
                </p>
              </NuxtLink>
            </li>
          </ul>
          <button type="button" class="dash__card-action">
            {{ t('appSections.dashboard.alerts.expiry.cta') }}
          </button>
        </template>
        <template v-else>
          <div class="dash__success-empty">
            <span class="dash__success-icon material-symbols-outlined" aria-hidden="true">
              task_alt
            </span>
            <p class="dash__success-title">{{ t('appSections.dashboard.alerts.expiry.emptyTitle') }}</p>
            <p class="dash__success-copy">{{ t('appSections.dashboard.alerts.expiry.emptyCopy') }}</p>
          </div>
        </template>
      </AlertsModuleCard>

      <AlertsModuleCard
        :title="t('appSections.dashboard.alerts.inspection.title')"
        :subtitle="t('appSections.dashboard.alerts.inspection.subtitle')"
        icon="build"
        :count="overview.inspectionExpiringSoon.count"
        :tone="inspectionWorstTone"
      >
        <template v-if="overview.inspectionExpiringSoon.items.length">
          <ul class="dash__alerts-list">
            <li
              v-for="{ row: car, badge } in inspectionRows"
              :key="car.id"
              class="dash__alerts-list-item"
            >
              <NuxtLink
                :to="fleetCarPath(car.id)"
                class="dash__alerts-item dash__alerts-item--link"
                :aria-label="t('appSections.dashboard.alerts.openCarDetails', { model: car.model })"
              >
                <div class="dash__alerts-item-head">
                  <div class="dash__alerts-item-main">
                    <p class="dash__alerts-item-title">{{ car.model }}</p>
                    <p v-if="car.plateNumber" class="dash__plate-chip">{{ car.plateNumber }}</p>
                  </div>
                  <span
                    class="dash__alerts-chip"
                    :class="`dash__alerts-chip--${badge.tone}`"
                  >
                    <span
                      v-if="inspectionChipIcon(badge.tone)"
                      class="dash__alerts-chip-icon material-symbols-outlined"
                      aria-hidden="true"
                    >
                      {{ inspectionChipIcon(badge.tone) }}
                    </span>
                    {{ badge.label }}
                  </span>
                </div>
                <p class="dash__alerts-item-meta">
                  {{ t('appSections.dashboard.alerts.meta.validUntil') }}
                  <span class="dash__alerts-item-meta-date">
                    {{ formatDate(car.inspectionValidUntil) }}
                  </span>
                </p>
              </NuxtLink>
            </li>
          </ul>
        </template>
        <template v-else>
          <div class="dash__success-empty">
            <span class="dash__success-icon material-symbols-outlined" aria-hidden="true">
              check_circle
            </span>
            <p class="dash__success-title">{{ t('appSections.dashboard.alerts.inspection.emptyTitle') }}</p>
            <p class="dash__success-copy">{{ t('appSections.dashboard.alerts.inspection.emptyCopy') }}</p>
          </div>
        </template>
      </AlertsModuleCard>
    </section>
  </div>
</template>

<style scoped>
.dash {
  display: grid;
  gap: 1.5rem;
}

.dash__fleet {
  display: grid;
  gap: 1rem;
}

.dash__fleet-error {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-error);
}

.dash__fleet-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 720px) {
  .dash__fleet-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.15rem;
  }
}

.dash__fleet-card {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  min-width: 0;
  background: var(--color-surface-container-low);
}

.dash__fleet-card--vehicles {
  background: linear-gradient(
    155deg,
    color-mix(in srgb, var(--color-secondary) 14%, var(--color-surface-container-low)) 0%,
    var(--color-surface-container-low) 48%,
    var(--color-surface-container-low) 100%
  );
}

.dash__fleet-card--drivers {
  background: linear-gradient(
    155deg,
    color-mix(in srgb, var(--color-tertiary, #2ba673) 12%, var(--color-surface-container-low)) 0%,
    var(--color-surface-container-low) 50%,
    var(--color-surface-container-low) 100%
  );
}

.dash__fleet-card-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 4px 0 0 4px;
  background: linear-gradient(
    180deg,
    var(--color-secondary) 0%,
    color-mix(in srgb, var(--color-secondary-container) 70%, var(--color-secondary)) 100%
  );
}

.dash__fleet-card-accent--drivers {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-tertiary, #2ba673) 88%, var(--color-secondary) 12%) 0%,
    color-mix(in srgb, var(--color-tertiary, #2ba673) 55%, var(--color-on-surface)) 100%
  );
}

.dash__fleet-card-inner {
  position: relative;
  padding: 1.15rem 1.15rem 1.15rem 1.35rem;
  display: grid;
  gap: 1.1rem;
}

.dash__fleet-card-head {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.dash__fleet-card-icon {
  font-size: 1.35rem;
  color: color-mix(in srgb, var(--color-secondary) 82%, var(--color-on-surface));
}

.dash__fleet-card--drivers .dash__fleet-card-icon {
  color: color-mix(in srgb, var(--color-tertiary, #2ba673) 78%, var(--color-on-surface));
}

.dash__fleet-card-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-on-surface);
}

.dash__fleet-card-metrics {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: stretch;
  gap: 0.65rem 0.85rem;
  padding: 0.85rem 0.75rem;
  border-radius: 0.85rem;
  background: var(--color-surface-container-lowest);
}

.dash__fleet-metric {
  display: grid;
  gap: 0.25rem;
  text-align: center;
  min-width: 0;
}

.dash__fleet-metric-label {
  margin: 0;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.dash__fleet-metric-value {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 700;
  line-height: 1.05;
  color: var(--color-secondary);
}

.dash__fleet-card--drivers .dash__fleet-metric-value:not(.dash__fleet-metric-value--muted) {
  color: color-mix(in srgb, var(--color-tertiary, #2ba673) 88%, var(--color-on-surface));
}

.dash__fleet-metric-value--muted {
  color: var(--color-on-surface);
  opacity: 0.88;
}

.dash__fleet-metric-divider {
  width: 1px;
  align-self: stretch;
  min-height: 2.75rem;
  margin: auto 0;
  background: color-mix(in srgb, var(--color-outline-variant) 22%, transparent);
  border-radius: 1px;
}

.dash__alerts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: start;
}

@media (min-width: 960px) {
  .dash__alerts {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.dash__success-empty {
  border-radius: 0.9rem;
  padding: 1.2rem;
  min-height: 12.5rem;
  display: grid;
  align-content: center;
  justify-items: center;
  text-align: center;
  background: var(--color-surface-container-lowest);
}

.dash__success-icon {
  font-size: 1.8rem;
  margin-bottom: 0.55rem;
  padding: 0.45rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-tertiary, #2ba673) 10%, transparent);
  color: color-mix(in srgb, var(--color-tertiary, #2ba673) 80%, white 6%);
}

.dash__success-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--color-on-surface);
}

.dash__success-copy {
  margin: 0.32rem 0 0;
  font-size: 0.82rem;
  line-height: 1.42;
  color: var(--color-on-surface-variant);
}

.dash__alerts-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.55rem;
}

.dash__alerts-list-item {
  display: block;
}

.dash__alerts-item {
  background: var(--color-surface-container-lowest);
  border-radius: 0.75rem;
  padding: 0.7rem 0.75rem;
}

.dash__alerts-item--link {
  text-decoration: none;
  color: inherit;
  display: block;
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.dash__alerts-item--link:hover {
  background: color-mix(in srgb, var(--color-secondary) 12%, var(--color-surface-container-lowest));
}

.dash__alerts-item--link:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  outline-offset: 2px;
}

.dash__alerts-item-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.6rem;
}

.dash__alerts-item-main {
  display: grid;
  gap: 0.28rem;
}

.dash__alerts-item-title {
  margin: 0;
  font-size: 0.86rem;
  font-weight: 700;
}

.dash__plate-chip {
  margin: 0;
  display: inline-flex;
  width: fit-content;
  align-items: center;
  border-radius: 0.375rem;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-on-surface);
  background: var(--color-surface-container-high);
}

.dash__alerts-item-meta {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  color: var(--color-on-surface-variant);
}

.dash__alerts-item-meta--dues {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.6rem;
}

.dash__alerts-item-meta-date {
  font-weight: 700;
}

.dash__alerts-item-amount {
  margin-left: auto;
  font-size: 0.98rem;
  font-weight: 800;
  color: var(--color-secondary);
  line-height: 1;
  white-space: nowrap;
}

.dash__alerts-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  border-radius: 999px;
  padding: 0.16rem 0.5rem;
  font-size: 0.68rem;
  font-weight: 800;
  white-space: nowrap;
}

.dash__alerts-chip-icon {
  font-size: 0.82rem;
}

.dash__alerts-chip--danger {
  background: color-mix(in srgb, var(--color-error-container) 92%, white 4%);
  color: var(--color-on-error-container);
}

.dash__alerts-chip--warning {
  background: color-mix(in srgb, #ffb020 24%, var(--color-surface-container-high));
  color: color-mix(in srgb, #8a5b00 76%, black 10%);
}

.dash__alerts-chip--success {
  background: color-mix(in srgb, var(--color-tertiary, #2ba673) 16%, var(--color-surface-container-high));
  color: color-mix(in srgb, var(--color-tertiary, #2ba673) 88%, black 6%);
}

.dash__alerts-chip--neutral {
  background: var(--color-surface-container-high);
  color: var(--color-on-surface-variant);
}

.dash__card-action {
  margin-top: auto;
  border: none;
  background: transparent;
  color: var(--color-secondary);
  font-weight: 700;
  font-size: 0.83rem;
  padding: 0;
  text-align: left;
  cursor: pointer;
}

.dash__alerts-state {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
}

.dash__alerts-state--error {
  color: var(--color-error);
}
</style>
