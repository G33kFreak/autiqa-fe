<script setup lang="ts">
import type {
  CarInsurancePaymentType,
  CarInsurancePolicyDto,
  CreateCarInsuranceInstallmentItemDto,
  CreateCarInsurancePolicyDto,
} from '#shared/dto/car-insurance.dto';
import EntityDialogShell from '~/components/shared/EntityDialogShell.vue';
import FleetDateInput from '~/components/fleet/FleetDateInput.vue';
import {
  centsToAmountString,
  dateInputToIsoNoon,
  isValidPolicyAmountString,
  sumInstallmentAmountsCents,
} from '~/utils/car-insurance-policy-form';

type PaymentPlanMode = 'one_time' | 'schedule' | 'already_paid';

const props = defineProps<{
  carId: string;
}>();

const emit = defineEmits<{
  created: [];
}>();

const { t } = useI18n();
const carInsuranceStore = useCarInsuranceStore();

const dialogShell = ref<InstanceType<typeof EntityDialogShell> | null>(null);
const formError = ref<string | null>(null);

function defaultEndDate(start: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(start.trim());
  if (!m) return '';
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  d.setFullYear(d.getFullYear() + 1);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

const coverageStartDate = ref('');
const coverageEndDate = ref('');
const oneTimeAmount = ref('');
const alreadyPaidAmount = ref('');
const currency = ref('PLN');
const insurerName = ref('');
const policyNumber = ref('');
const notes = ref('');

const paymentPlanMode = ref<PaymentPlanMode>('one_time');
const oneTimeDueDate = ref('');

type ScheduleRow = { dueDate: string; amount: string };
const scheduleRows = ref<ScheduleRow[]>([{ dueDate: '', amount: '' }]);

const editingPolicy = ref<CarInsurancePolicyDto | null>(null);

const isEditing = computed(() => editingPolicy.value !== null);
const dialogTitle = computed(() =>
  isEditing.value
    ? t('appSections.fleet.vehicleDetails.insurancePolicyDialog.editTitle')
    : t('appSections.fleet.vehicleDetails.insurancePolicyDialog.title'),
);
const dialogLead = computed(() =>
  isEditing.value
    ? t('appSections.fleet.vehicleDetails.insurancePolicyDialog.editLead')
    : t('appSections.fleet.vehicleDetails.insurancePolicyDialog.lead'),
);
const submitLabel = computed(() =>
  isEditing.value
    ? t('appSections.fleet.vehicleDetails.insurancePolicyDialog.submitEdit')
    : t('appSections.fleet.vehicleDetails.insurancePolicyDialog.submit'),
);
const submitting = computed(
  () =>
    carInsuranceStore.creating
    || carInsuranceStore.updating
    || carInsuranceStore.replacingInstallments
    || carInsuranceStore.payingInstallment,
);

function toDateInput(raw: string | null | undefined): string {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function policyRows(policy: CarInsurancePolicyDto): Array<{ dueDate: string; amount: string; expenseId: string | null }> {
  return policy.installments
    .slice()
    .sort((a, b) => a.sequence - b.sequence)
    .map((i) => ({ dueDate: toDateInput(i.dueDate), amount: i.amount, expenseId: i.expenseId }));
}

function fillFormFromPolicy(policy: CarInsurancePolicyDto) {
  editingPolicy.value = policy;
  coverageStartDate.value = toDateInput(policy.coverageStart);
  coverageEndDate.value = toDateInput(policy.coverageEnd);
  currency.value = policy.currency || 'PLN';
  insurerName.value = policy.insurerName ?? '';
  policyNumber.value = policy.policyNumber ?? '';
  notes.value = policy.notes ?? '';
  const rows = policyRows(policy);
  const hasPaid = rows.some((r) => r.expenseId);
  if (hasPaid) {
    paymentPlanMode.value = 'already_paid';
    alreadyPaidAmount.value = rows[0]?.amount ?? '';
    oneTimeAmount.value = '';
    scheduleRows.value = [{ dueDate: '', amount: '' }];
    oneTimeDueDate.value = coverageStartDate.value;
    return;
  }
  if (policy.paymentType === 'ONE_TIME' || rows.length <= 1) {
    paymentPlanMode.value = 'one_time';
    oneTimeAmount.value = rows[0]?.amount ?? '';
    oneTimeDueDate.value = rows[0]?.dueDate ?? coverageEndDate.value;
    alreadyPaidAmount.value = '';
    scheduleRows.value = [{ dueDate: '', amount: '' }];
    return;
  }
  paymentPlanMode.value = 'schedule';
  scheduleRows.value = rows.map((r) => ({ dueDate: r.dueDate, amount: r.amount }));
  oneTimeAmount.value = '';
  alreadyPaidAmount.value = '';
  oneTimeDueDate.value = coverageEndDate.value;
}

watch(
  [
    paymentPlanMode,
    coverageStartDate,
    coverageEndDate,
    oneTimeAmount,
    alreadyPaidAmount,
    oneTimeDueDate,
    scheduleRows,
  ],
  () => {
    if (formError.value) formError.value = null;
  },
  { deep: true },
);

function showModal(policyToEdit?: CarInsurancePolicyDto | null) {
  resetForm();
  if (policyToEdit) {
    fillFormFromPolicy(policyToEdit);
  }
  dialogShell.value?.showModal();
}

function close() {
  dialogShell.value?.close();
}

function resetDialogState() {
  formError.value = null;
}

function resetForm() {
  formError.value = null;
  const start = todayIsoDate();
  coverageStartDate.value = start;
  const end = defaultEndDate(start);
  coverageEndDate.value = end;
  oneTimeAmount.value = '';
  alreadyPaidAmount.value = '';
  currency.value = 'PLN';
  insurerName.value = '';
  policyNumber.value = '';
  notes.value = '';
  paymentPlanMode.value = 'one_time';
  oneTimeDueDate.value = end;
  scheduleRows.value = [{ dueDate: '', amount: '' }];
  editingPolicy.value = null;
}

function addScheduleRow() {
  scheduleRows.value = [...scheduleRows.value, { dueDate: '', amount: '' }];
}

function removeScheduleRow(index: number) {
  if (scheduleRows.value.length <= 1) return;
  scheduleRows.value = scheduleRows.value.filter((_, i) => i !== index);
}

function normalizeCurrency() {
  currency.value = currency.value.trim().toUpperCase().slice(0, 3);
}

function buildInstallmentsPayload(): CreateCarInsuranceInstallmentItemDto[] | null {
  if (paymentPlanMode.value === 'one_time') {
    const d = oneTimeDueDate.value.trim();
    const amt = oneTimeAmount.value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
    if (!isValidPolicyAmountString(amt)) return null;
    return [{ dueDate: dateInputToIsoNoon(d), amount: amt }];
  }

  if (paymentPlanMode.value === 'already_paid') {
    const amt = alreadyPaidAmount.value.trim();
    const d = coverageStartDate.value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
    if (!isValidPolicyAmountString(amt)) return null;
    return [{ dueDate: dateInputToIsoNoon(d), amount: amt }];
  }

  const rows = scheduleRows.value;
  if (rows.length < 1) return null;
  const out: CreateCarInsuranceInstallmentItemDto[] = [];
  for (const row of rows) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.dueDate.trim())) return null;
    if (!isValidPolicyAmountString(row.amount)) return null;
    out.push({
      dueDate: dateInputToIsoNoon(row.dueDate),
      amount: row.amount.trim(),
    });
  }
  return out;
}

function toApiPaymentType(mode: PaymentPlanMode): CarInsurancePaymentType {
  if (mode === 'schedule') return 'INSTALLMENTS';
  return 'ONE_TIME';
}

function validateBeforeSubmit(): string | null {
  if (!coverageStartDate.value || !coverageEndDate.value) {
    return t('appSections.fleet.vehicleDetails.insurancePolicyDialog.validation.dates');
  }
  if (coverageEndDate.value <= coverageStartDate.value) {
    return t('appSections.fleet.vehicleDetails.insurancePolicyDialog.validation.coverageOrder');
  }
  if (paymentPlanMode.value === 'one_time') {
    const amt = oneTimeAmount.value.trim();
    if (!amt || !isValidPolicyAmountString(amt)) {
      return t('appSections.fleet.vehicleDetails.insurancePolicyDialog.validation.amount');
    }
  }
  if (paymentPlanMode.value === 'already_paid') {
    const amt = alreadyPaidAmount.value.trim();
    if (!amt || !isValidPolicyAmountString(amt)) {
      return t('appSections.fleet.vehicleDetails.insurancePolicyDialog.validation.alreadyPaidAmount');
    }
  }
  normalizeCurrency();
  if (currency.value.length !== 3) {
    return t('appSections.fleet.vehicleDetails.insurancePolicyDialog.validation.currency');
  }
  if (paymentPlanMode.value === 'one_time') {
    const d = oneTimeDueDate.value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      return t('appSections.fleet.vehicleDetails.insurancePolicyDialog.validation.oneTimeDue');
    }
  }

  const installments = buildInstallmentsPayload();
  if (!installments?.length) {
    return t('appSections.fleet.vehicleDetails.insurancePolicyDialog.validation.installments');
  }
  const sumCents = sumInstallmentAmountsCents(installments);
  if (sumCents === null) {
    return t('appSections.fleet.vehicleDetails.insurancePolicyDialog.validation.sumMismatch');
  }
  return null;
}

async function onSubmit() {
  formError.value = null;
  const validation = validateBeforeSubmit();
  if (validation) {
    formError.value = validation;
    return;
  }
  const installments = buildInstallmentsPayload()!;
  try {
    const totalCents = sumInstallmentAmountsCents(installments);
    if (totalCents === null) {
      formError.value = t('appSections.fleet.vehicleDetails.insurancePolicyDialog.validation.sumMismatch');
      return;
    }
    const apiPaymentType = toApiPaymentType(paymentPlanMode.value);
    const payload: CreateCarInsurancePolicyDto = {
      paymentType: apiPaymentType,
      coverageStart: dateInputToIsoNoon(coverageStartDate.value),
      coverageEnd: dateInputToIsoNoon(coverageEndDate.value),
      paymentAmount: centsToAmountString(totalCents),
    };
    if (apiPaymentType === 'INSTALLMENTS') {
      payload.installments = installments;
    }
    if (currency.value && currency.value !== 'PLN') {
      payload.currency = currency.value;
    }
    if (insurerName.value.trim()) payload.insurerName = insurerName.value.trim();
    if (policyNumber.value.trim()) payload.policyNumber = policyNumber.value.trim();
    if (notes.value.trim()) payload.notes = notes.value.trim();
    if (isEditing.value && editingPolicy.value) {
      const policyId = editingPolicy.value.id;
      const updatePayload: Parameters<typeof carInsuranceStore.updatePolicy>[2] = {
        paymentType: apiPaymentType,
        coverageStart: payload.coverageStart,
        coverageEnd: payload.coverageEnd,
        paymentAmount: payload.paymentAmount,
        currency: payload.currency,
        insurerName: payload.insurerName,
        policyNumber: payload.policyNumber,
        notes: payload.notes,
      };
      if (apiPaymentType === 'INSTALLMENTS') {
        updatePayload.installments = installments;
      }
      await carInsuranceStore.updatePolicy(props.carId, policyId, updatePayload);

      const prevRows = policyRows(editingPolicy.value).map((r) => ({
        dueDate: r.dueDate,
        amount: r.amount,
      }));
      const nextRows = installments.map((i) => ({
        dueDate: toDateInput(i.dueDate),
        amount: i.amount,
      }));
      const needsReplace = JSON.stringify(prevRows) !== JSON.stringify(nextRows);
      if (apiPaymentType === 'INSTALLMENTS' && needsReplace) {
        await carInsuranceStore.replaceInstallments(props.carId, policyId, { installments });
      }

      if (paymentPlanMode.value === 'already_paid') {
        const refreshed = await carInsuranceStore.fetchPolicyById(props.carId, policyId);
        const unpaid = refreshed.installments.find((i) => i.expenseId == null);
        if (unpaid) {
          await carInsuranceStore.payInstallment(
            props.carId,
            policyId,
            unpaid.id,
            { occurredAt: dateInputToIsoNoon(coverageStartDate.value) },
          );
        }
      }
    } else {
      const created = await carInsuranceStore.createPolicy(props.carId, payload);
      if (paymentPlanMode.value === 'already_paid') {
        const installmentId = created.installments[0]?.id;
        if (!installmentId) {
          formError.value = t('appSections.fleet.vehicleDetails.insurancePolicyDialog.errorPaidAuto');
          return;
        }
        await carInsuranceStore.payInstallment(
          props.carId,
          created.id,
          installmentId,
          { occurredAt: dateInputToIsoNoon(coverageStartDate.value) },
        );
      }
    }
    emit('created');
    close();
  } catch {
    formError.value = t('appSections.fleet.vehicleDetails.insurancePolicyDialog.error');
  }
}

defineExpose({ showModal, close });
</script>

<template>
  <EntityDialogShell
    ref="dialogShell"
    title-id="fleet-insurance-policy-dialog-title"
    :title="dialogTitle"
    :lead="dialogLead"
    width="min(56rem, calc(100vw - 2rem))"
    max-height="none"
    body-max-height="min(72dvh, 44rem)"
    @close="resetDialogState"
  >
    <template #body>
      <form id="fleet-insurance-policy-form" class="app-dialog-form" @submit.prevent="onSubmit">
        <AppDialogSection
          icon="description"
          :title="t('appSections.fleet.vehicleDetails.insurancePolicyDialog.sectionPolicy')"
        >
          <div class="app-dialog-grid app-dialog-grid--2">
            <label class="app-dialog-field">
              <span>{{ t('appSections.fleet.vehicleDetails.insurancePolicyDialog.insurerName') }}</span>
              <input
                v-model="insurerName"
                class="ti-input"
                type="text"
                maxlength="500"
                autocomplete="organization"
                :placeholder="t('appSections.fleet.vehicleDetails.insurancePolicyDialog.insurerPlaceholder')"
              >
            </label>
            <label class="app-dialog-field">
              <span>{{ t('appSections.fleet.vehicleDetails.insurancePolicyDialog.policyNumber') }}</span>
              <input
                v-model="policyNumber"
                class="ti-input"
                type="text"
                maxlength="200"
                :placeholder="t('appSections.fleet.vehicleDetails.insurancePolicyDialog.policyNumberPlaceholder')"
              >
            </label>
            <label class="app-dialog-field">
              <span>{{ t('appSections.fleet.vehicleDetails.insurancePolicyDialog.coverageStart') }}</span>
              <FleetDateInput
                v-model="coverageStartDate"
                input-id="ins-coverage-start"
                :title="t('appSections.fleet.vehicleDetails.insurancePolicyDialog.coverageStart')"
              />
            </label>
            <label class="app-dialog-field">
              <span>{{ t('appSections.fleet.vehicleDetails.insurancePolicyDialog.coverageEnd') }}</span>
              <FleetDateInput
                v-model="coverageEndDate"
                input-id="ins-coverage-end"
                :title="t('appSections.fleet.vehicleDetails.insurancePolicyDialog.coverageEnd')"
              />
            </label>
          </div>
        </AppDialogSection>

        <AppDialogSection
          icon="payments"
          muted
          :title="t('appSections.fleet.vehicleDetails.insurancePolicyDialog.sectionPremium')"
        >
          <div class="app-dialog-grid app-dialog-grid--2 ins-policy__grid--premium">
            <!-- <label class="ins-policy__field">
              <span>{{ t('appSections.fleet.vehicleDetails.insurancePolicyDialog.currency') }}</span>
              <input
                v-model="currency"
                class="ti-input"
                type="text"
                maxlength="3"
                spellcheck="false"
                @blur="normalizeCurrency"
              >
            </label> -->

            <div class="ins-policy__plan-panel app-dialog-field--full">
              <fieldset class="ins-policy__plan-fieldset">
                <legend class="ins-policy__plan-legend">
                  {{ t('appSections.fleet.vehicleDetails.insurancePolicyDialog.paymentPlanLabel') }}
                </legend>
                <div class="ins-policy__mode-row" role="presentation">
                  <label class="ins-policy__radio">
                    <input
                      v-model="paymentPlanMode"
                      type="radio"
                      value="one_time"
                      class="ins-policy__radio-input"
                    >
                    <span class="ins-policy__radio-label">{{
                      t('appSections.fleet.vehicleDetails.insurancePolicyDialog.paymentPlanOneTime')
                    }}</span>
                  </label>
                  <label class="ins-policy__radio">
                    <input
                      v-model="paymentPlanMode"
                      type="radio"
                      value="schedule"
                      class="ins-policy__radio-input"
                    >
                    <span class="ins-policy__radio-label">{{
                      t('appSections.fleet.vehicleDetails.insurancePolicyDialog.paymentPlanSchedule')
                    }}</span>
                  </label>
                  <label class="ins-policy__radio">
                    <input
                      v-model="paymentPlanMode"
                      type="radio"
                      value="already_paid"
                      class="ins-policy__radio-input"
                    >
                    <span class="ins-policy__radio-label">{{
                      t('appSections.fleet.vehicleDetails.insurancePolicyDialog.paymentPlanAlreadyPaid')
                    }}</span>
                  </label>
                </div>
              </fieldset>

              <div v-if="paymentPlanMode === 'one_time'" class="ins-policy__one-time">
                <label class="app-dialog-field app-dialog-field--full">
                  <span>{{ t('appSections.fleet.vehicleDetails.insurancePolicyDialog.oneTimeAmount') }}</span>
                  <input
                    v-model="oneTimeAmount"
                    class="ti-input app-dialog-input--amount"
                    type="text"
                    inputmode="decimal"
                    placeholder="5000.00"
                  >
                </label>
                <label class="app-dialog-field app-dialog-field--full">
                  <span>{{ t('appSections.fleet.vehicleDetails.insurancePolicyDialog.oneTimeDueDate') }}</span>
                  <FleetDateInput
                    v-model="oneTimeDueDate"
                    input-id="ins-one-time-due"
                    :title="t('appSections.fleet.vehicleDetails.insurancePolicyDialog.oneTimeDueDate')"
                  />
                </label>
              </div>

              <div v-else-if="paymentPlanMode === 'schedule'" class="ins-policy__schedule">
                <div
                  v-for="(row, idx) in scheduleRows"
                  :key="idx"
                  class="ins-policy__schedule-row"
                >
                  <FleetDateInput
                    v-model="row.dueDate"
                    :input-id="`ins-schedule-due-${idx}`"
                    :title="t('appSections.fleet.vehicleDetails.insurancePolicyDialog.dueDate')"
                  />
                  <label class="ins-policy__schedule-amt">
                    <span class="ins-policy__sr-only">{{
                      t('appSections.fleet.vehicleDetails.insurancePolicyDialog.amount')
                    }}</span>
                    <input
                      v-model="row.amount"
                      class="ti-input"
                      type="text"
                      inputmode="decimal"
                      :placeholder="t('appSections.fleet.vehicleDetails.insurancePolicyDialog.amount')"
                    >
                  </label>
                  <button
                    v-if="scheduleRows.length > 1"
                    type="button"
                    class="ins-policy__icon-btn"
                    :aria-label="t('appSections.fleet.vehicleDetails.insurancePolicyDialog.removeRow')"
                    @click="removeScheduleRow(idx)"
                  >
                    <span class="material-symbols-outlined" aria-hidden="true">delete</span>
                  </button>
                </div>
                <button type="button" class="ins-policy__add-row" @click="addScheduleRow">
                  <span class="material-symbols-outlined" aria-hidden="true">add</span>
                  {{ t('appSections.fleet.vehicleDetails.insurancePolicyDialog.addInstallment') }}
                </button>
              </div>
              <div v-else class="ins-policy__one-time">
                <label class="app-dialog-field app-dialog-field--full">
                  <span>{{ t('appSections.fleet.vehicleDetails.insurancePolicyDialog.alreadyPaidAmount') }}</span>
                  <input
                    v-model="alreadyPaidAmount"
                    class="ti-input app-dialog-input--amount"
                    type="text"
                    inputmode="decimal"
                    placeholder="5000.00"
                  >
                </label>
              </div>
            </div>
          </div>
        </AppDialogSection>

        <AppDialogSection
          icon="notes"
          :title="t('appSections.fleet.vehicleDetails.insurancePolicyDialog.sectionNotes')"
        >
          <label class="app-dialog-field app-dialog-field--full">
            <span>{{ t('appSections.fleet.vehicleDetails.insurancePolicyDialog.notes') }}</span>
            <textarea
              v-model="notes"
              class="ti-input app-dialog-textarea"
              rows="3"
              maxlength="5000"
              :placeholder="t('appSections.fleet.vehicleDetails.insurancePolicyDialog.notesPlaceholder')"
            />
          </label>
        </AppDialogSection>
      </form>
    </template>
    <template #footer>
      <AppDialogFooter
        :error="formError"
        :cancel-label="t('appSections.fleet.vehicleDetails.cancel')"
        :submit-label="submitting ? t('common.loading') : submitLabel"
        :submit-disabled="submitting"
        form-id="fleet-insurance-policy-form"
        @cancel="close"
      />
    </template>
  </EntityDialogShell>
</template>

<style scoped>
.ins-policy__grid--premium {
  align-items: start;
}

.ins-policy__plan-panel {
  margin-top: 0.25rem;
  padding: 0.9rem 1rem;
  border-radius: 0.65rem;
  background: var(--color-surface-container-lowest);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-outline-variant) 12%, transparent);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.ins-policy__plan-fieldset {
  margin: 0;
  padding: 0;
  border: none;
  min-width: 0;
}

.ins-policy__plan-legend {
  padding: 0;
  margin: 0 0 0.5rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.ins-policy__mode-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem 1.25rem;
}

.ins-policy__radio {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-on-surface);
}

.ins-policy__radio-input {
  accent-color: var(--color-secondary);
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.ins-policy__one-time {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}


.ins-policy__schedule-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(5.5rem, 8rem) auto;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.ins-policy__schedule-row :deep(.fleet-date-input) {
  min-width: 0;
}

.ins-policy__schedule-amt {
  min-width: 0;
}

.ins-policy__icon-btn {
  border: none;
  border-radius: 0.5rem;
  width: 2.25rem;
  height: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--color-on-surface-variant);
  cursor: pointer;
}

.ins-policy__icon-btn:hover {
  background: color-mix(in srgb, var(--color-error) 10%, transparent);
  color: var(--color-error);
}

.ins-policy__add-row {
  margin-top: 0.25rem;
  border: none;
  border-radius: 0.5rem;
  padding: 0.45rem 0.65rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  color: var(--color-secondary);
  background: transparent;
}

.ins-policy__add-row:hover {
  background: color-mix(in srgb, var(--color-secondary) 10%, transparent);
}

.ins-policy__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 640px) {
  .ins-policy__schedule-row {
    grid-template-columns: 1fr;
  }
}
</style>
