<script setup lang="ts">
import type { CreateCarInsuranceDto } from '#shared/dto/car-insurance.dto';
import BaseDialog from '~/components/app/BaseDialog.vue';
import { dateInputToIso, toDateInputValue } from '~/utils/format';

const props = defineProps<{
  currency: string;
  submit: (body: CreateCarInsuranceDto) => Promise<void>;
}>();

const { t } = useI18n();
const dialog = ref<InstanceType<typeof BaseDialog> | null>(null);
const providerInput = ref<HTMLInputElement | null>(null);
const formId = useId();

const provider = ref('');
const policyNumber = ref('');
const coverageStart = ref('');
const coverageEnd = ref('');
const premium = ref('');
const installmentCount = ref(1);
const errors = reactive({ provider: false, coverage: false, premium: false });
const saving = ref(false);
const error = ref('');

function addYear(input: string): string {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  d.setFullYear(d.getFullYear() + 1);
  return toDateInputValue(d.toISOString());
}

function open() {
  const today = toDateInputValue(new Date().toISOString());
  provider.value = '';
  policyNumber.value = '';
  coverageStart.value = today;
  coverageEnd.value = addYear(today);
  premium.value = '';
  installmentCount.value = 1;
  errors.provider = false;
  errors.coverage = false;
  errors.premium = false;
  error.value = '';
  dialog.value?.open();
  nextTick(() => providerInput.value?.focus());
}

async function onSubmit() {
  error.value = '';
  errors.provider = !provider.value.trim();
  const start = coverageStart.value;
  const end = coverageEnd.value;
  errors.coverage =
    !start || !end || new Date(end).getTime() <= new Date(start).getTime();
  const premiumValue = Number(premium.value);
  errors.premium = !Number.isFinite(premiumValue) || premiumValue <= 0;
  if (errors.provider || errors.coverage || errors.premium) return;

  saving.value = true;
  try {
    await props.submit({
      provider: provider.value.trim(),
      policyNumber: policyNumber.value.trim() || null,
      coverageStart: dateInputToIso(start),
      coverageEnd: dateInputToIso(end),
      premium: premiumValue.toFixed(2),
      currency: props.currency,
      installmentCount: installmentCount.value,
    });
    dialog.value?.close();
  } catch {
    error.value = t('app.car.insurance.error');
  } finally {
    saving.value = false;
  }
}

defineExpose({ open });
</script>

<template>
  <BaseDialog
    ref="dialog"
    :title="t('app.car.insurance.addTitle')"
    :subtitle="t('app.car.insurance.subtitle')"
    icon="shield"
  >
    <form :id="formId" class="ui-form" novalidate @submit.prevent="onSubmit">
      <Transition name="ip-fade">
        <p v-if="error" class="ui-banner ui-banner--error" role="alert">
          <AppIcon name="alert" :size="16" />
          <span>{{ error }}</span>
        </p>
      </Transition>

      <div class="ui-grid-2">
        <div class="ui-field">
          <label class="ui-label" :for="`${formId}-provider`">
            {{ t('app.car.insurance.providerLabel') }}
            <span class="ui-req" aria-hidden="true">*</span>
          </label>
          <input
            :id="`${formId}-provider`"
            ref="providerInput"
            v-model="provider"
            type="text"
            class="ui-input"
            :class="{ 'ui-input--error': errors.provider }"
            maxlength="60"
            :disabled="saving"
            @input="errors.provider = false"
          >
        </div>
        <div class="ui-field">
          <label class="ui-label" :for="`${formId}-number`">
            {{ t('app.car.insurance.numberLabel') }}
          </label>
          <input
            :id="`${formId}-number`"
            v-model="policyNumber"
            type="text"
            class="ui-input ui-input--mono"
            maxlength="40"
            :disabled="saving"
          >
        </div>
      </div>

      <div class="ui-grid-2">
        <div class="ui-field">
          <label class="ui-label" :for="`${formId}-start`">
            {{ t('app.car.insurance.startLabel') }}
          </label>
          <input
            :id="`${formId}-start`"
            v-model="coverageStart"
            type="date"
            class="ui-input"
            :class="{ 'ui-input--error': errors.coverage }"
            :disabled="saving"
            @input="errors.coverage = false"
          >
        </div>
        <div class="ui-field">
          <label class="ui-label" :for="`${formId}-end`">
            {{ t('app.car.insurance.endLabel') }}
            <span class="ui-req" aria-hidden="true">*</span>
          </label>
          <input
            :id="`${formId}-end`"
            v-model="coverageEnd"
            type="date"
            class="ui-input"
            :class="{ 'ui-input--error': errors.coverage }"
            :disabled="saving"
            @input="errors.coverage = false"
          >
        </div>
      </div>
      <p v-if="errors.coverage" class="ui-hint ui-hint--error">
        {{ t('app.car.insurance.coverageInvalid') }}
      </p>

      <div class="ui-grid-2">
        <div class="ui-field">
          <label class="ui-label" :for="`${formId}-premium`">
            {{ t('app.car.insurance.premiumLabel') }}
            <span class="ui-req" aria-hidden="true">*</span>
          </label>
          <div class="ip__amount">
            <span class="ip__currency">{{ currency }}</span>
            <input
              :id="`${formId}-premium`"
              v-model="premium"
              type="text"
              inputmode="decimal"
              class="ui-input ui-input--mono ip__amount-input"
              :class="{ 'ui-input--error': errors.premium }"
              placeholder="0.00"
              :disabled="saving"
              @input="errors.premium = false"
            >
          </div>
        </div>
        <div class="ui-field">
          <label class="ui-label" :for="`${formId}-installments`">
            {{ t('app.car.insurance.installmentsLabel') }}
          </label>
          <select
            :id="`${formId}-installments`"
            v-model.number="installmentCount"
            class="ui-select"
            :disabled="saving"
          >
            <option :value="1">{{ t('app.car.insurance.payInFull') }}</option>
            <option v-for="n in [2, 3, 4, 6, 12]" :key="n" :value="n">
              {{ t('app.car.insurance.installmentsN', { n }) }}
            </option>
          </select>
        </div>
      </div>
    </form>

    <template #footer="{ close }">
      <div class="ip__actions">
        <button type="button" class="ui-btn ui-btn--ghost" :disabled="saving" @click="close">
          {{ t('app.common.cancel') }}
        </button>
        <button type="submit" :form="formId" class="ui-btn ui-btn--primary" :disabled="saving">
          <span v-if="saving" class="ui-spinner" aria-hidden="true" />
          <span>{{ saving ? t('app.common.saving') : t('app.car.insurance.savePolicy') }}</span>
        </button>
      </div>
    </template>
  </BaseDialog>
</template>

<style scoped>
.ip__amount {
  position: relative;
  display: flex;
  align-items: center;
}

.ip__currency {
  position: absolute;
  left: 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-muted);
  pointer-events: none;
}

.ip__amount-input {
  padding-left: 3.1rem;
}

.ip__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.ip-fade-enter-active,
.ip-fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.ip-fade-enter-from,
.ip-fade-leave-to {
  opacity: 0;
}

@media (max-width: 420px) {
  .ip__actions {
    flex-direction: column-reverse;
  }
  .ip__actions .ui-btn {
    width: 100%;
  }
}
</style>
