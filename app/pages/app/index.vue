<script setup lang="ts">
import AddDriverDialog from '~/components/drivers/AddDriverDialog.vue';
import AddVehicleDialog from '~/components/fleet/AddVehicleDialog.vue';
import AlertsModuleCard from '~/components/dashboard/AlertsModuleCard.vue';
import PageStateLoader from '~/components/shared/PageStateLoader.vue';

const { t, locale } = useI18n();
const localePath = useLocalePath();
const alertsStore = useAlertsStore();
const carsStore = useCarsStore();
const driversStore = useDriversStore();

const overview = computed(() => alertsStore.overview);

const addVehicleDialog = ref<InstanceType<typeof AddVehicleDialog> | null>(null);
const addDriverDialog = ref<InstanceType<typeof AddDriverDialog> | null>(null);

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
  <div v-else class="dash app-page app-stagger">
    <AppPageHeader
      :kicker="t('layout.appTagline')"
      :title="t('appSections.dashboard.title')"
      :lead="t('appSections.dashboard.lead')"
    />

    <AppSection :title="t('appSections.dashboard.fleetStats.title')">
      <p v-if="fleetStatsError" class="dash__fleet-error" role="alert">
        {{ t('appSections.dashboard.fleetStats.loadError') }}
      </p>
      <div v-if="fleetStats.totalCars !== null" class="app-stat-grid">
        <AppStatCard
          :title="t('appSections.dashboard.fleetStats.carsTitle')"
          icon="directions_car"
          tone="electric"
          :assigned-label="t('appSections.dashboard.fleetStats.assigned')"
          :assigned-value="fleetStats.carsWithDriver"
          :total-label="t('appSections.dashboard.fleetStats.total')"
          :total-value="fleetStats.totalCars"
          :add-aria-label="t('appSections.fleet.addVehicleCta')"
          @add="addVehicleDialog?.showModal()"
        />
        <AppStatCard
          :title="t('appSections.dashboard.fleetStats.driversTitle')"
          icon="badge"
          tone="success"
          :assigned-label="t('appSections.dashboard.fleetStats.assigned')"
          :assigned-value="fleetStats.driversAssigned"
          :total-label="t('appSections.dashboard.fleetStats.total')"
          :total-value="fleetStats.totalDrivers"
          :add-aria-label="t('appSections.drivers.addDriverCta')"
          @add="addDriverDialog?.showModal()"
        />
      </div>
    </AppSection>

    <p v-if="alertsStore.error" class="dash__alerts-state dash__alerts-state--error" role="alert">
      {{ t('appSections.dashboard.alerts.loadError') }}
    </p>

    <AppSection
      v-if="overview"
      :title="t('appSections.dashboard.alerts.hero.title')"
      :description="t('appSections.dashboard.alerts.hero.lead')"
      id="dash-alerts-heading"
    >
    <div class="app-alert-grid" aria-live="polite">
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
                    class="app-chip"
                    :class="`app-chip--${badge.tone}`"
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
        </template>
        <template v-else>
          <DashboardAlertEmptyState
            icon="verified"
            :title="t('appSections.dashboard.alerts.dues.emptyTitle')"
            :copy="t('appSections.dashboard.alerts.dues.emptyCopy')"
          />
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
                    class="app-chip"
                    :class="`app-chip--${badge.tone}`"
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
        </template>
        <template v-else>
          <DashboardAlertEmptyState
            icon="shield"
            :title="t('appSections.dashboard.alerts.expiry.emptyTitle')"
            :copy="t('appSections.dashboard.alerts.expiry.emptyCopy')"
          />
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
                    class="app-chip"
                    :class="`app-chip--${badge.tone}`"
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
          <DashboardAlertEmptyState
            icon="build"
            :title="t('appSections.dashboard.alerts.inspection.emptyTitle')"
            :copy="t('appSections.dashboard.alerts.inspection.emptyCopy')"
          />
        </template>
      </AlertsModuleCard>
    </div>
    </AppSection>

    <AddVehicleDialog ref="addVehicleDialog" :navigate-to-created-detail="true" />
    <AddDriverDialog ref="addDriverDialog" :navigate-to-created-detail="true" />
  </div>
</template>

<style scoped>
.dash__fleet-error {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-error);
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
    background-color var(--app-duration-fast, 160ms) var(--app-ease-out, ease),
    transform var(--app-duration-fast, 160ms) var(--app-ease-out, ease);
}

@media (hover: hover) and (pointer: fine) {
  .dash__alerts-item--link:hover {
    background: color-mix(in srgb, var(--color-secondary) 10%, var(--color-surface-container-lowest));
    transform: translateX(2px);
  }
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

.dash__alerts-chip-icon {
  font-size: 0.82rem;
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
