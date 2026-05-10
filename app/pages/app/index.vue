<script setup lang="ts">
import AlertsModuleCard from '~/components/dashboard/AlertsModuleCard.vue';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const alertsStore = useAlertsStore();

const overview = computed(() => alertsStore.overview);

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
  locale.value;
  const items = overview.value?.InsuranceExpiringSoon.items ?? [];
  return items.map((row) => ({
    row,
    badge: inspectionBadge(row.insurance.coverageEnd),
  }));
});

const insuranceDuesRows = computed(() => {
  locale.value;
  const items = overview.value?.InsuranceDuesExpiringSoon.items ?? [];
  return items.map((row) => ({
    row,
    badge: duesBadge(row.installment.dueDate),
  }));
});

const inspectionRows = computed(() => {
  locale.value;
  const items = overview.value?.inspectionExpiringSoon.items ?? [];
  return items.map((row) => ({
    row,
    badge: inspectionBadge(row.inspectionValidUntil),
  }));
});

useSeoMeta({
  title: computed(() => t('meta.app.title')),
  description: computed(() => t('meta.app.description')),
});

onMounted(async () => {
  try {
    await alertsStore.fetchOverview();
  } catch {
    // UI already reacts to store error state.
  }
});

async function onLogout() {
  await authStore.logout();
}
</script>

<template>
  <div class="dash">
    <header class="dash__hero">
      <div>
        <p class="dash__hero-kicker">{{ t('appSections.dashboard.alerts.hero.kicker') }}</p>
        <h1 class="dash__hero-title">{{ t('appSections.dashboard.alerts.hero.title') }}</h1>
        <p class="dash__hero-lead">
          {{ t('appSections.dashboard.alerts.hero.lead') }}
        </p>
      </div>
      <div class="dash__hero-actions">
        <button
          type="button"
          class="dash__secondary"
          :disabled="alertsStore.loading"
          @click="alertsStore.fetchOverview"
        >
          {{
            alertsStore.loading
              ? t('appSections.dashboard.alerts.refreshing')
              : t('appSections.dashboard.alerts.refresh')
          }}
        </button>
        <button type="button" class="dash__ghost-btn" @click="onLogout">
          {{ t('appShell.logoutDebug') }}
        </button>
      </div>
    </header>

    <p v-if="alertsStore.loading && !overview" class="dash__alerts-state">
      {{ t('appSections.dashboard.alerts.loading') }}
    </p>
    <p v-else-if="alertsStore.error" class="dash__alerts-state dash__alerts-state--error">
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
              class="dash__alerts-item"
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
              class="dash__alerts-item"
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
              class="dash__alerts-item"
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

.dash__hero {
  padding: 1.4rem 1.5rem;
  border-radius: 1.1rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  background: linear-gradient(
    140deg,
    color-mix(in srgb, var(--color-secondary-container) 92%, var(--color-secondary)) 0%,
    color-mix(in srgb, var(--color-secondary-container) 72%, var(--color-surface-container-lowest)) 100%
  );
  color: var(--color-on-secondary);
}

.dash__hero-kicker {
  margin: 0 0 0.4rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.85;
}

.dash__hero-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.45rem, 3.5vw, 2rem);
  line-height: 1.1;
}

.dash__hero-lead {
  margin: 0.65rem 0 1rem;
  font-size: 0.925rem;
  max-width: 56ch;
  opacity: 0.92;
}

.dash__hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-items: flex-end;
}

.dash__secondary,
.dash__ghost-btn {
  border: none;
  border-radius: 0.75rem;
  padding: 0.55rem 0.95rem;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
}

.dash__secondary {
  color: var(--color-on-surface);
  background: var(--color-surface-container-high);
}

.dash__ghost-btn {
  color: var(--color-on-secondary);
  background: color-mix(in srgb, var(--color-on-secondary) 14%, transparent);
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

.dash__alerts-item {
  background: var(--color-surface-container-lowest);
  border-radius: 0.75rem;
  padding: 0.7rem 0.75rem;
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
