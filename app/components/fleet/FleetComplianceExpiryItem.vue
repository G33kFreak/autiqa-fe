<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string;
    validUntil: string;
    attachments?: readonly string[];
    icon?: 'verified' | 'shield';
  }>(),
  { icon: 'verified' },
);

const { t } = useI18n();

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function daysLeft(value: string): number {
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return 0;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.ceil((startOfTarget.getTime() - startOfToday.getTime()) / msPerDay);
  return Math.max(diffDays, 0);
}

function progressFromDaysLeft(days: number, maxDays = 365): number {
  const clamped = Math.min(Math.max(days, 0), maxDays);
  return Math.round((clamped / maxDays) * 100);
}

const inspectionDaysLeft = computed(() => daysLeft(props.validUntil));
const progress = computed(() => progressFromDaysLeft(inspectionDaysLeft.value));
const isWarning = computed(() => inspectionDaysLeft.value <= 30);
const hasValidDate = computed(() => !Number.isNaN(new Date(props.validUntil).getTime()));

const iconName = computed(() => (props.icon === 'shield' ? 'shield' : 'verified'));
</script>

<template>
  <article class="compliance-item">
    <div class="compliance-item__head">
      <div class="compliance-item__head-text">
        <p class="compliance-item__eyebrow">
          {{ t('appSections.fleet.vehicleDetails.complianceItemStatusLabel') }}
        </p>
        <h3 class="compliance-item__title">{{ props.title }}</h3>
      </div>
      <div class="compliance-item__icon-wrap" aria-hidden="true">
        <span class="material-symbols-outlined compliance-item__icon">{{
          iconName
        }}</span>
      </div>
    </div>

    <div
      class="compliance-item__date-row"
      :class="{ 'compliance-item__date-row--empty': !hasValidDate }"
    >
      <span class="compliance-item__date-label">{{
        t('appSections.fleet.vehicleDetails.validUntilLabel')
      }}</span>
      <span class="compliance-item__date-value">{{
        hasValidDate
          ? formatDate(props.validUntil)
          : t('appSections.fleet.vehicleDetails.dateNotSet')
      }}</span>
    </div>

    <div v-if="hasValidDate" class="compliance-item__meter">
      <div class="compliance-item__meter-labels">
        <span class="compliance-item__meter-label">{{
          t('appSections.fleet.vehicleDetails.timeRemaining')
        }}</span>
        <span
          class="compliance-item__meter-value"
          :class="{
            'compliance-item__meter-value--ok': !isWarning,
            'compliance-item__meter-value--warn': isWarning,
          }"
        >
          {{
            t('appSections.fleet.inspectionDaysLeft', {
              count: inspectionDaysLeft,
            })
          }}
        </span>
      </div>
      <div
        class="compliance-item__bar"
        role="progressbar"
        :aria-valuenow="progress"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="t('appSections.fleet.vehicleDetails.timeRemaining')"
      >
        <div
          class="compliance-item__bar-fill"
          :class="{
            'compliance-item__bar-fill--ok': !isWarning,
            'compliance-item__bar-fill--warn': isWarning,
          }"
          :style="{ width: `${progress}%` }"
        />
      </div>
    </div>
  </article>
</template>

<style scoped>
.compliance-item {
  border-radius: 1rem;
  padding: 1.15rem 1.2rem 1.2rem;
  background: var(--color-surface-container-lowest);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--color-on-surface) 2%, transparent);
}

.compliance-item__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.compliance-item__head-text {
  min-width: 0;
}

.compliance-item__eyebrow {
  margin: 0 0 0.2rem;
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.compliance-item__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: var(--color-on-surface);
}

.compliance-item__icon-wrap {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-secondary-fixed);
  color: var(--color-secondary-container);
}

.compliance-item__icon {
  font-size: 1.25rem;
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'GRAD' 0,
    'opsz' 24;
}

.compliance-item__date-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.9rem;
  border-radius: 0.75rem;
  background: var(--color-surface-container);
}

.compliance-item__date-row--empty .compliance-item__date-value {
  color: var(--color-on-surface-variant);
  font-weight: 600;
}

.compliance-item__date-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-on-surface-variant);
}

.compliance-item__date-value {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--color-on-surface);
}

.compliance-item__meter {
  margin-top: 1rem;
}

.compliance-item__meter-labels {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.45rem;
}

.compliance-item__meter-label {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.compliance-item__meter-value {
  font-size: 0.75rem;
  font-weight: 600;
}

.compliance-item__meter-value--ok {
  color: var(--color-secondary);
}

.compliance-item__meter-value--warn {
  color: var(--color-error);
}

.compliance-item__bar {
  height: 0.5rem;
  width: 100%;
  border-radius: 9999px;
  background: var(--color-surface-variant);
  overflow: hidden;
}

.compliance-item__bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.35s ease;
}

.compliance-item__bar-fill--ok {
  background: var(--color-secondary);
}

.compliance-item__bar-fill--warn {
  background: var(--color-error);
}
</style>
