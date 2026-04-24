<script setup lang="ts">
const props = defineProps<{
  title: string;
  validUntil: string;
  attachments?: readonly string[];
}>();

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
</script>

<template>
  <article class="compliance-item">
    <p class="compliance-item__label">{{ props.title }}</p>
    <div class="compliance-item__status">
      <div
        v-if="hasValidDate"
        class="compliance-item__progress"
        :class="{
          'compliance-item__progress--ok': !isWarning,
          'compliance-item__progress--warning': isWarning,
        }"
      >
        <svg class="compliance-item__ring" viewBox="0 0 36 36" aria-hidden="true">
          <circle class="compliance-item__track" cx="18" cy="18" r="15.9155" />
          <circle
            class="compliance-item__value"
            cx="18"
            cy="18"
            r="15.9155"
            :stroke-dasharray="`${progress}, 100`"
          />
        </svg>
        <span>{{ progress }}%</span>
      </div>
      <div v-else class="compliance-item__progress-placeholder">
        {{ t('appSections.fleet.vehicleDetails.dateNotSet') }}
      </div>

      <div class="compliance-item__status-copy">
        <p v-if="hasValidDate" class="compliance-item__title">
          {{ t('appSections.fleet.vehicleDetails.validUntil', { date: formatDate(props.validUntil) }) }}
        </p>
        <p v-else class="compliance-item__title">
          {{ t('appSections.fleet.vehicleDetails.dateNotSet') }}
        </p>
        <p
          v-if="hasValidDate"
          class="compliance-item__counter"
          :class="{
            'compliance-item__counter--ok': !isWarning,
            'compliance-item__counter--warning': isWarning,
          }"
        >
          {{ t('appSections.fleet.inspectionDaysLeft', { count: inspectionDaysLeft }) }}
        </p>
        <p v-if="props.attachments?.length" class="compliance-item__attachments">
          {{ t('appSections.fleet.vehicleDetails.attachments') }}: {{ props.attachments.join(', ') }}
        </p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.compliance-item {
  border-radius: 0.875rem;
  background: var(--color-surface-container-lowest);
  padding: 0.9rem;
  border-left: 0.23rem solid var(--color-secondary);
}

.compliance-item__label {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.compliance-item__status {
  margin-top: 0.55rem;
  display: flex;
  gap: 0.75rem;
}

.compliance-item__status-copy {
  min-width: 0;
}

.compliance-item__title {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.2;
  font-weight: 800;
  color: var(--color-on-surface);
}

.compliance-item__counter {
  margin: 0.3rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.2;
  font-weight: 700;
}

.compliance-item__counter--ok {
  color: var(--color-secondary);
}

.compliance-item__counter--warning {
  color: var(--color-error);
}

.compliance-item__attachments {
  margin: 0.4rem 0 0;
  font-size: 0.75rem;
  line-height: 1.25;
  color: var(--color-on-surface-variant);
}

.compliance-item__progress {
  --progress-color: var(--color-secondary);
  --ring-size: 3.6rem;
  --ring-thickness: 3.8;
  flex-shrink: 0;
  position: relative;
  width: var(--ring-size);
  height: var(--ring-size);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--color-surface-container-lowest);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-outline-variant) 15%, transparent);
}

.compliance-item__progress span {
  position: relative;
  z-index: 1;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--color-on-surface);
}

.compliance-item__progress-placeholder {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 50%;
  background: var(--color-surface-container-high);
  color: var(--color-on-surface-variant);
  font-size: 0.6875rem;
  font-weight: 700;
  text-align: center;
  padding: 0.35rem;
}

.compliance-item__ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.compliance-item__track,
.compliance-item__value {
  fill: none;
  stroke-width: var(--ring-thickness);
}

.compliance-item__track {
  stroke: var(--color-surface-container-high);
}

.compliance-item__value {
  stroke: var(--progress-color);
  stroke-linecap: round;
}

.compliance-item__progress--ok {
  --progress-color: var(--color-secondary);
}

.compliance-item__progress--warning {
  --progress-color: var(--color-error);
}
</style>
