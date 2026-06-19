<script setup lang="ts">
import type { CarInsuranceDto } from '#shared/dto/car-insurance.dto';
import type { ComplianceStatus } from '~/utils/compliance';
import { formatDate, toDateInputValue } from '~/utils/format';

const props = defineProps<{
  inspectionDate: string | null;
  insuranceDate: string | null;
  inspectionStatus: ComplianceStatus;
  insuranceStatus: ComplianceStatus;
  activePolicy: CarInsuranceDto | null;
  savingInspection?: boolean;
}>();

const emit = defineEmits<{
  'save-inspection': [isoDate: string];
  'view-insurance': [];
}>();

const { t, locale } = useI18n();

const editing = ref(false);
const draft = ref('');

function statusLabel(status: ComplianceStatus): string {
  const { tone, daysLeft } = status;
  if (tone === 'missing' || daysLeft === null) return t('app.fleet.compliance.notSet');
  if (tone === 'overdue') return t('app.fleet.compliance.overdue', { n: Math.abs(daysLeft) });
  if (daysLeft === 0) return t('app.fleet.compliance.today');
  return t('app.fleet.compliance.inDays', { n: daysLeft });
}

function startEdit() {
  draft.value = toDateInputValue(props.inspectionDate);
  editing.value = true;
}

function cancelEdit() {
  editing.value = false;
}

function save() {
  emit('save-inspection', draft.value);
}

// Close the inline editor once a save resolves (saving flips back to false).
watch(
  () => props.savingInspection,
  (now, was) => {
    if (was && !now) editing.value = false;
  },
);
</script>

<template>
  <section class="cs" aria-labelledby="cs-title">
    <div class="ui-section-head cs__head">
      <h2 id="cs-title" class="ui-section-title">{{ t('app.car.compliance.title') }}</h2>
    </div>

    <!-- Inspection -->
    <div class="cs__item">
      <div class="cs__item-head">
        <span class="cs__item-icon" :data-tone="inspectionStatus.tone" aria-hidden="true">
          <AppIcon name="check" :size="18" />
        </span>
        <div class="cs__item-copy">
          <span class="cs__item-label">{{ t('app.car.compliance.inspection') }}</span>
          <span class="cs__item-date">{{ formatDate(inspectionDate, locale) }}</span>
        </div>
        <button
          v-if="!editing"
          type="button"
          class="ui-iconbtn cs__edit"
          :aria-label="t('app.car.compliance.editInspection')"
          @click="startEdit"
        >
          <AppIcon name="edit" :size="16" />
        </button>
      </div>

      <div v-if="editing" class="cs__edit-row">
        <input
          v-model="draft"
          type="date"
          class="ui-input cs__date-input"
          :disabled="savingInspection"
          :aria-label="t('app.car.compliance.inspection')"
        >
        <button
          type="button"
          class="ui-btn ui-btn--primary ui-btn--sm"
          :disabled="savingInspection"
          @click="save"
        >
          <span v-if="savingInspection" class="ui-spinner" aria-hidden="true" />
          <span v-else>{{ t('app.common.save') }}</span>
        </button>
        <button
          type="button"
          class="ui-btn ui-btn--ghost ui-btn--sm"
          :disabled="savingInspection"
          @click="cancelEdit"
        >
          {{ t('app.common.cancel') }}
        </button>
      </div>
      <span v-else class="ui-chip cs__chip" :data-tone="inspectionStatus.tone">
        {{ statusLabel(inspectionStatus) }}
      </span>
    </div>

    <div class="cs__divider" role="presentation" />

    <!-- Insurance -->
    <div class="cs__item">
      <div class="cs__item-head">
        <span class="cs__item-icon" :data-tone="insuranceStatus.tone" aria-hidden="true">
          <AppIcon name="shield" :size="18" />
        </span>
        <div class="cs__item-copy">
          <span class="cs__item-label">{{ t('app.car.compliance.insurance') }}</span>
          <span class="cs__item-date">{{ formatDate(insuranceDate, locale) }}</span>
        </div>
        <button
          type="button"
          class="ui-iconbtn cs__edit"
          :aria-label="t('app.car.compliance.manageInsurance')"
          @click="emit('view-insurance')"
        >
          <AppIcon name="chevron-right" :size="18" />
        </button>
      </div>

      <div class="cs__insurance-foot">
        <span class="ui-chip cs__chip" :data-tone="insuranceStatus.tone">
          {{ statusLabel(insuranceStatus) }}
        </span>
        <span v-if="activePolicy" class="cs__provider">{{ activePolicy.provider }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cs {
  padding: var(--space-5);
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-lg);
  background: var(--color-bg);
}

.cs__head {
  margin-bottom: var(--space-4);
}

.cs__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.cs__item-head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.cs__item-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  background: var(--color-surface-mid);
  color: var(--color-muted);
}

.cs__item-icon[data-tone='ok'] {
  background: var(--color-comply-bg);
  color: var(--color-comply);
}

.cs__item-icon[data-tone='soon'] {
  background: var(--color-warn-bg);
  color: var(--color-warn-text);
}

.cs__item-icon[data-tone='urgent'],
.cs__item-icon[data-tone='overdue'] {
  background: var(--color-risk-bg);
  color: var(--color-risk);
}

.cs__item-copy {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.cs__item-label {
  font-size: 0.8125rem;
  color: var(--color-muted);
}

.cs__item-date {
  font-size: 0.9375rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
}

.cs__edit {
  flex-shrink: 0;
}

.cs__chip {
  align-self: flex-start;
}

.cs__edit-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.cs__date-input {
  flex: 1 1 9rem;
  min-width: 0;
}

.cs__divider {
  height: 1px;
  margin: var(--space-4) 0;
  background: var(--color-surface-mid);
}

.cs__insurance-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.cs__provider {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-muted);
}
</style>
