<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string;
    validUntil: string;
    attachments?: readonly string[];
    icon?: 'verified' | 'shield';
    /** Show primary CTA in empty state (e.g. nudge user toward vehicle details). */
    showEmptyCta?: boolean;
  }>(),
  { icon: 'verified', showEmptyCta: true },
);

const emit = defineEmits<{
  emptyCtaClick: [];
}>();

const { t } = useI18n();
const emptyHeadingId = useId();

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

const emptyCopyKey = computed(() =>
  props.icon === 'shield'
    ? 'appSections.fleet.vehicleDetails.complianceItemEmptyCopyInsurance'
    : 'appSections.fleet.vehicleDetails.complianceItemEmptyCopy',
);

const emptyCtaKey = computed(() =>
  props.icon === 'shield'
    ? 'appSections.fleet.vehicleDetails.complianceItemEmptyCtaInsurance'
    : 'appSections.fleet.vehicleDetails.complianceItemEmptyCtaInspection',
);
</script>

<template>
  <article
    v-if="hasValidDate"
    class="compliance-item compliance-item--filled"
  >
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

    <div class="compliance-item__date-row">
      <span class="compliance-item__date-label">{{
        t('appSections.fleet.vehicleDetails.validUntilLabel')
      }}</span>
      <span class="compliance-item__date-value">{{
        formatDate(props.validUntil)
      }}</span>
    </div>

    <div class="compliance-item__meter">
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

  <article
    v-else
    class="compliance-item compliance-item--empty"
    :aria-labelledby="emptyHeadingId"
  >
    <div class="compliance-item__empty-top">
      <div class="compliance-item__head-text">
        <p class="compliance-item__eyebrow">
          {{ t('appSections.fleet.vehicleDetails.complianceItemStatusLabel') }}
        </p>
        <h3 :id="emptyHeadingId" class="compliance-item__title">
          {{ props.title }}
        </h3>
      </div>
      <div
        class="compliance-item__icon-wrap compliance-item__icon-wrap--empty"
        aria-hidden="true"
      >
        <span class="material-symbols-outlined compliance-item__icon compliance-item__icon--empty"
          >event_upcoming</span
        >
      </div>
    </div>

    <div class="compliance-item__empty-body">
      <p class="compliance-item__empty-lead">
        {{ t('appSections.fleet.vehicleDetails.complianceItemEmptyTitle') }}
      </p>
      <p class="compliance-item__empty-copy">
        {{ t(emptyCopyKey) }}
      </p>
      <button
        v-if="showEmptyCta"
        type="button"
        class="compliance-item__empty-cta"
        @click="emit('emptyCtaClick')"
      >
        <span
          class="material-symbols-outlined compliance-item__empty-cta-icon"
          aria-hidden="true"
          >edit_calendar</span
        >
        {{ t(emptyCtaKey) }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.compliance-item {
  border-radius: 1rem;
  padding: 1.15rem 1.2rem 1.2rem;
}

.compliance-item--filled {
  background: var(--color-surface-container-lowest);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--color-on-surface) 2%, transparent);
}

.compliance-item--empty {
  background: color-mix(
    in srgb,
    var(--color-secondary-fixed) 14%,
    var(--color-surface-container-lowest)
  );
  border: 1px dashed
    color-mix(in srgb, var(--color-secondary) 32%, var(--color-outline-variant));
  box-shadow: none;
}

.compliance-item__empty-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.compliance-item__empty-body {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.45rem;
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  border-radius: 0;
}

.compliance-item__empty-lead {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.35;
  color: var(--color-on-surface);
}

.compliance-item__empty-copy {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.5;
  color: var(--color-on-surface-variant);
}

.compliance-item__empty-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 0.5rem;
  align-self: flex-start;
  border: 0;
  border-radius: 0.65rem;
  padding: 0.5rem 0.85rem;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  color: var(--color-on-secondary);
  background: var(--color-secondary);
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.compliance-item__empty-cta:hover {
  filter: brightness(1.06);
}

.compliance-item__empty-cta:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 45%, transparent);
  outline-offset: 2px;
}

.compliance-item__empty-cta-icon {
  font-size: 1.05rem;
  line-height: 1;
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'GRAD' 0,
    'opsz' 24;
}

.compliance-item__icon-wrap--empty {
  background: color-mix(in srgb, var(--color-surface-container) 80%, transparent);
  color: var(--color-secondary);
}

.compliance-item__icon--empty {
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'GRAD' 0,
    'opsz' 24;
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
