<script setup lang="ts">
import {
  inspectionDaysLeftClamped,
  inspectionUrgencyFillPercent,
  isInspectionDueOrExpired,
} from '~/utils/fleet-inspection-expiry';

const props = withDefaults(
  defineProps<{
    title: string;
    validUntil: string;
    attachments?: readonly string[];
    icon?: 'verified' | 'shield';
    dues?: Array<{
      id: string;
      policyId: string;
      expenseId?: string | null;
      dueDate: string;
      amountLabel: string;
      paid: boolean;
      processing?: boolean;
    }>;
    /** Show primary CTA in empty state (e.g. nudge user toward vehicle details). */
    showEmptyCta?: boolean;
  }>(),
  { icon: 'verified', showEmptyCta: true },
);

const emit = defineEmits<{
  emptyCtaClick: [kind: 'inspection' | 'insurance'];
  editClick: [kind: 'inspection' | 'insurance'];
  dueToggle: [
    payload: {
      dueId: string;
      policyId: string;
      expenseId: string | null;
      dueDate: string;
      paid: boolean;
    },
  ];
}>();

function complianceKind(): 'inspection' | 'insurance' {
  return props.icon === 'shield' ? 'insurance' : 'inspection';
}

function onEmptyCtaClick() {
  emit('emptyCtaClick', complianceKind());
}

function onEditClick() {
  emit('editClick', complianceKind());
}

function onDueToggle(due: {
  id: string;
  policyId: string;
  expenseId?: string | null;
  dueDate: string;
  paid: boolean;
}) {
  emit('dueToggle', {
    dueId: due.id,
    policyId: due.policyId,
    expenseId: due.expenseId ?? null,
    dueDate: due.dueDate,
    paid: due.paid,
  });
}

type DueState = 'paid' | 'overdue' | 'upcoming';

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dueState(due: { dueDate: string; paid: boolean }): DueState {
  if (due.paid) return 'paid';
  const dueAt = new Date(due.dueDate);
  if (Number.isNaN(dueAt.getTime())) return 'upcoming';
  const today = startOfLocalDay(new Date()).getTime();
  const dueDay = startOfLocalDay(dueAt).getTime();
  return dueDay <= today ? 'overdue' : 'upcoming';
}

function dueStateIcon(state: DueState): string {
  if (state === 'paid') return 'check_circle';
  if (state === 'overdue') return 'warning';
  return 'schedule';
}

function dueStateLabel(state: DueState): string {
  if (state === 'paid') return t('appSections.fleet.vehicleDetails.complianceDuePaid');
  if (state === 'overdue') {
    return t('appSections.fleet.vehicleDetails.complianceDueOverdue');
  }
  return t('appSections.fleet.vehicleDetails.complianceDueUpcoming');
}

function dueStateTooltip(state: DueState): string {
  if (state === 'paid') {
    return t('appSections.fleet.vehicleDetails.complianceDueTooltipPaid');
  }
  if (state === 'overdue') {
    return t('appSections.fleet.vehicleDetails.complianceDueTooltipOverdue');
  }
  return t('appSections.fleet.vehicleDetails.complianceDueTooltipUpcoming');
}

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

const inspectionDaysLeft = computed(
  () => inspectionDaysLeftClamped(props.validUntil) ?? 0,
);
const isDueOrExpired = computed(() => isInspectionDueOrExpired(props.validUntil));
const urgencyFill = computed(() =>
  inspectionUrgencyFillPercent(inspectionDaysLeft.value),
);
const isWarning = computed(() => inspectionDaysLeft.value <= 30);
/** ≤7d: critical (red). 8–30d: amber warning. */
const isCritical = computed(() => inspectionDaysLeft.value <= 7);
const hasValidDate = computed(() => !Number.isNaN(new Date(props.validUntil).getTime()));
const hasDues = computed(
  () => props.icon === 'shield' && (props.dues?.length ?? 0) > 0,
);

/** Status glyph: warning when ≤30d, else verified/shield. */
const statusIconName = computed(() => {
  if (isWarning.value) {
    return 'warning';
  }
  return props.icon === 'shield' ? 'shield' : 'verified';
});

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
      <div class="compliance-item__head-actions">
        <button
          type="button"
          class="compliance-item__edit"
          :aria-label="t('appSections.fleet.vehicleDetails.complianceItemEditDateAria')"
          @click="onEditClick"
        >
          <span class="material-symbols-outlined compliance-item__edit-icon" aria-hidden="true"
            >edit</span
          >
        </button>
        <div
          class="compliance-item__icon-wrap"
          :class="{
            'compliance-item__icon-wrap--critical': isCritical,
            'compliance-item__icon-wrap--warn': isWarning && !isCritical,
          }"
          aria-hidden="true"
        >
          <span
            class="material-symbols-outlined compliance-item__icon"
            :class="{
              'compliance-item__icon--warn': isWarning && !isCritical,
              'compliance-item__icon--critical': isCritical,
            }"
            >{{ statusIconName }}</span
          >
        </div>
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
            'compliance-item__meter-value--critical': isCritical,
            'compliance-item__meter-value--warn': isWarning && !isCritical,
          }"
        >
          {{
            isDueOrExpired
              ? t('appSections.fleet.complianceExpired')
              : t('appSections.fleet.inspectionDaysLeft', {
                  count: inspectionDaysLeft,
                })
          }}
        </span>
      </div>
      <div
        class="compliance-item__bar"
        role="progressbar"
        :aria-valuenow="urgencyFill"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuetext="
          isDueOrExpired
            ? t('appSections.fleet.complianceExpired')
            : t('appSections.fleet.inspectionDaysLeft', {
                count: inspectionDaysLeft,
              })
        "
        :aria-label="t('appSections.fleet.vehicleDetails.timeRemaining')"
      >
        <div
          class="compliance-item__bar-fill"
          :class="{
            'compliance-item__bar-fill--ok': !isWarning,
            'compliance-item__bar-fill--critical': isCritical,
            'compliance-item__bar-fill--warn': isWarning && !isCritical,
          }"
          :style="{ width: `${urgencyFill}%` }"
        />
      </div>
    </div>

    <div v-if="hasDues" class="compliance-item__dues">
      <div class="compliance-item__dues-head">
        <span class="compliance-item__dues-label">
          {{ t('appSections.fleet.vehicleDetails.complianceDuesLabel') }}
        </span>
      </div>
      <ul class="compliance-item__dues-list">
        <li
          v-for="due in props.dues"
          :key="due.id"
          class="compliance-item__due-item"
        >
          <span class="compliance-item__due-amount">{{ due.amountLabel }}</span>
          <span class="compliance-item__due-date-wrap">
            <span class="compliance-item__due-date">{{ formatDate(due.dueDate) }}</span>
            <span
              class="material-symbols-outlined compliance-item__due-date-status-icon"
              :class="{
                'compliance-item__due-date-status-icon--paid': dueState(due) === 'paid',
                'compliance-item__due-date-status-icon--overdue': dueState(due) === 'overdue',
                'compliance-item__due-date-status-icon--upcoming': dueState(due) === 'upcoming',
              }"
              :title="dueStateTooltip(dueState(due))"
              :aria-label="dueStateTooltip(dueState(due))"
              tabindex="0"
            >{{ dueStateIcon(dueState(due)) }}</span>
          </span>
          <span
            class="compliance-item__due-status"
            :class="{
              'compliance-item__due-status--paid': dueState(due) === 'paid',
              'compliance-item__due-status--overdue': dueState(due) === 'overdue',
              'compliance-item__due-status--upcoming': dueState(due) === 'upcoming',
            }"
          >
            {{ dueStateLabel(dueState(due)) }}
          </span>
          <button
            type="button"
            class="compliance-item__due-action"
            :disabled="due.processing"
            @click="onDueToggle(due)"
          >
            {{
              due.processing
                ? t('common.loading')
                : due.paid
                  ? t('appSections.fleet.vehicleDetails.complianceDueMarkUnpaid')
                  : t('appSections.fleet.vehicleDetails.complianceDueMarkPaid')
            }}
          </button>
        </li>
      </ul>
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
        @click="onEmptyCtaClick"
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

.compliance-item__head-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.compliance-item__edit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: 1px solid color-mix(in srgb, var(--color-outline-variant) 55%, transparent);
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-surface-container-lowest) 88%, transparent);
  color: var(--color-on-surface-variant);
  cursor: pointer;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.compliance-item__edit:hover {
  background: var(--color-surface-container-high);
  border-color: color-mix(in srgb, var(--color-secondary) 28%, var(--color-outline-variant));
  color: var(--color-secondary);
}

.compliance-item__edit:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 40%, transparent);
  outline-offset: 2px;
}

.compliance-item__edit-icon {
  font-size: 1.05rem;
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'GRAD' 0,
    'opsz' 24;
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

.compliance-item__icon-wrap--warn {
  background: color-mix(
    in srgb,
    #fbbf24 22%,
    var(--color-surface-container-lowest)
  );
  color: #d97706;
}

.compliance-item__icon-wrap--critical {
  background: color-mix(
    in srgb,
    var(--color-error) 14%,
    var(--color-surface-container-lowest)
  );
  color: var(--color-error);
}

.compliance-item__icon {
  font-size: 1.25rem;
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'GRAD' 0,
    'opsz' 24;
}

.compliance-item__icon--warn {
  font-variation-settings:
    'FILL' 1,
    'wght' 500,
    'GRAD' 0,
    'opsz' 24;
}

.compliance-item__icon--critical {
  font-variation-settings:
    'FILL' 1,
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
  color: #d97706;
}

.compliance-item__meter-value--critical {
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
  background: #f59e0b;
}

.compliance-item__bar-fill--critical {
  background: var(--color-error);
}

.compliance-item__dues {
  margin-top: 0.95rem;
  padding: 0.85rem;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--color-surface-container) 76%, transparent);
}

.compliance-item__dues-head {
  margin-bottom: 0.45rem;
}

.compliance-item__dues-label {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.compliance-item__dues-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.compliance-item__due-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: auto auto auto;
  align-items: center;
  column-gap: 0.65rem;
  row-gap: 0.5rem;
  padding: 0.58rem 0.62rem;
  border-radius: 0.6rem;
  background: var(--color-surface-container-lowest);
}

.compliance-item__due-date-wrap {
  grid-column: 2;
  grid-row: 1;
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
}

.compliance-item__due-date {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-on-surface-variant);
}

.compliance-item__due-amount {
  grid-column: 1;
  grid-row: 1;
  justify-self: start;
  font-family: var(--font-display);
  font-size: 1.06rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.1;
  color: var(--color-on-surface);
}

.compliance-item__due-status {
  grid-column: 1 / -1;
  grid-row: 2;
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
  border-radius: 999px;
  padding: 0.22rem 0.55rem;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.compliance-item__due-status--paid {
  color: #0f766e;
  background: color-mix(in srgb, #14b8a6 20%, var(--color-surface-container-lowest));
}

.compliance-item__due-status--upcoming {
  color: #b45309;
  background: color-mix(in srgb, #f59e0b 23%, var(--color-surface-container-lowest));
}

.compliance-item__due-status--overdue {
  color: var(--color-error);
  background: color-mix(
    in srgb,
    var(--color-error) 18%,
    var(--color-surface-container-lowest)
  );
}

.compliance-item__due-date-status-icon {
  font-size: 0.82rem;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: help;
  border-radius: 999px;
  padding: 0.14rem;
  font-variation-settings:
    'FILL' 1,
    'wght' 500,
    'GRAD' 0,
    'opsz' 24;
}

.compliance-item__due-date-status-icon:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 40%, transparent);
  outline-offset: 2px;
}

.compliance-item__due-date-status-icon--paid {
  color: #0f766e;
  background: color-mix(in srgb, #14b8a6 15%, transparent);
}

.compliance-item__due-date-status-icon--upcoming {
  color: #b45309;
  background: color-mix(in srgb, #f59e0b 18%, transparent);
}

.compliance-item__due-date-status-icon--overdue {
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 18%, transparent);
}

.compliance-item__due-action {
  grid-column: 1 / -1;
  grid-row: 3;
  justify-self: stretch;
  flex-shrink: 0;
  border: none;
  border-radius: 0.5rem;
  width: 100%;
  text-align: center;
  padding: 0.44rem 0.62rem;
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--color-secondary);
  background: color-mix(in srgb, var(--color-secondary-fixed) 30%, transparent);
  cursor: pointer;
}

.compliance-item__due-action:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-secondary-fixed) 46%, transparent);
}

.compliance-item__due-action:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
