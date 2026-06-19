<script setup lang="ts">
import {
  LEDGER_INCOME_CATEGORIES,
  LEDGER_EXPENSE_CATEGORIES,
  type CreateLedgerEntryDto,
  type LedgerDirection,
  type LedgerCategory,
  type LedgerEntryDto,
} from '#shared/dto/ledger-entry.dto';
import BaseDialog from '~/components/app/BaseDialog.vue';
import { dateInputToIso, toDateInputValue } from '~/utils/format';

const props = defineProps<{
  currency: string;
  submit: (body: CreateLedgerEntryDto, editingId: string | null) => Promise<void>;
}>();

const { t } = useI18n();
const dialog = ref<InstanceType<typeof BaseDialog> | null>(null);
const amountInput = ref<HTMLInputElement | null>(null);
const formId = useId();

const editingId = ref<string | null>(null);
const direction = ref<LedgerDirection>('expense');
const category = ref<LedgerCategory>('maintenance');
const amount = ref('');
const occurredAt = ref('');
const note = ref('');
const amountError = ref(false);
const saving = ref(false);
const error = ref('');

const categories = computed<readonly LedgerCategory[]>(() =>
  direction.value === 'income' ? LEDGER_INCOME_CATEGORIES : LEDGER_EXPENSE_CATEGORIES,
);

function todayInput(): string {
  return toDateInputValue(new Date().toISOString());
}

function setDirection(next: LedgerDirection) {
  if (direction.value === next) return;
  direction.value = next;
  category.value = categories.value[0]!;
}

function openCreate(presetDirection: LedgerDirection = 'expense') {
  editingId.value = null;
  direction.value = presetDirection;
  category.value = categories.value[0]!;
  amount.value = '';
  occurredAt.value = todayInput();
  note.value = '';
  amountError.value = false;
  error.value = '';
  dialog.value?.open();
  nextTick(() => amountInput.value?.focus());
}

function openEdit(entry: LedgerEntryDto) {
  editingId.value = entry.id;
  direction.value = entry.direction;
  category.value = entry.category;
  amount.value = String(Number(entry.amount) || 0);
  occurredAt.value = toDateInputValue(entry.occurredAt);
  note.value = entry.note ?? '';
  amountError.value = false;
  error.value = '';
  dialog.value?.open();
  nextTick(() => amountInput.value?.focus());
}

async function onSubmit() {
  error.value = '';
  const value = Number(amount.value);
  if (!Number.isFinite(value) || value <= 0) {
    amountError.value = true;
    amountInput.value?.focus();
    return;
  }
  saving.value = true;
  try {
    await props.submit(
      {
        direction: direction.value,
        category: category.value,
        amount: value.toFixed(2),
        currency: props.currency,
        occurredAt: dateInputToIso(occurredAt.value) || new Date().toISOString(),
        note: note.value.trim() || null,
      },
      editingId.value,
    );
    dialog.value?.close();
  } catch {
    error.value = t('app.car.ledger.error');
  } finally {
    saving.value = false;
  }
}

defineExpose({ openCreate, openEdit });
</script>

<template>
  <BaseDialog
    ref="dialog"
    :title="editingId ? t('app.car.ledger.editTitle') : t('app.car.ledger.addTitle')"
    :subtitle="t('app.car.ledger.subtitle')"
    :icon="direction === 'income' ? 'trending-up' : 'wallet'"
  >
    <form :id="formId" class="ui-form" novalidate @submit.prevent="onSubmit">
      <Transition name="le-fade">
        <p v-if="error" class="ui-banner ui-banner--error" role="alert">
          <AppIcon name="alert" :size="16" />
          <span>{{ error }}</span>
        </p>
      </Transition>

      <div
        class="le__toggle"
        role="group"
        :aria-label="t('app.car.ledger.directionLabel')"
      >
        <button
          type="button"
          class="le__toggle-btn"
          :class="{ 'le__toggle-btn--active le__toggle-btn--income': direction === 'income' }"
          :aria-pressed="direction === 'income'"
          @click="setDirection('income')"
        >
          <AppIcon name="trending-up" :size="17" />
          {{ t('app.car.ledger.income') }}
        </button>
        <button
          type="button"
          class="le__toggle-btn"
          :class="{ 'le__toggle-btn--active le__toggle-btn--expense': direction === 'expense' }"
          :aria-pressed="direction === 'expense'"
          @click="setDirection('expense')"
        >
          <AppIcon name="trending-down" :size="17" />
          {{ t('app.car.ledger.expense') }}
        </button>
      </div>

      <div class="ui-grid-2">
        <div class="ui-field">
          <label class="ui-label" :for="`${formId}-amount`">
            {{ t('app.car.ledger.amountLabel') }}
            <span class="ui-req" aria-hidden="true">*</span>
          </label>
          <div class="le__amount">
            <span class="le__currency">{{ currency }}</span>
            <input
              :id="`${formId}-amount`"
              ref="amountInput"
              v-model="amount"
              type="text"
              inputmode="decimal"
              class="ui-input ui-input--mono le__amount-input"
              :class="{ 'ui-input--error': amountError }"
              placeholder="0.00"
              :aria-invalid="amountError"
              :disabled="saving"
              @input="amountError = false"
            >
          </div>
          <p v-if="amountError" class="ui-hint ui-hint--error">
            {{ t('app.car.ledger.amountRequired') }}
          </p>
        </div>

        <div class="ui-field">
          <label class="ui-label" :for="`${formId}-date`">
            {{ t('app.car.ledger.dateLabel') }}
          </label>
          <input
            :id="`${formId}-date`"
            v-model="occurredAt"
            type="date"
            class="ui-input"
            :disabled="saving"
          >
        </div>
      </div>

      <div class="ui-field">
        <label class="ui-label" :for="`${formId}-category`">
          {{ t('app.car.ledger.categoryLabel') }}
        </label>
        <select
          :id="`${formId}-category`"
          v-model="category"
          class="ui-select"
          :disabled="saving"
        >
          <option v-for="c in categories" :key="c" :value="c">
            {{ t(`app.car.ledger.categories.${c}`) }}
          </option>
        </select>
      </div>

      <div class="ui-field">
        <label class="ui-label" :for="`${formId}-note`">
          {{ t('app.car.ledger.noteLabel') }}
        </label>
        <textarea
          :id="`${formId}-note`"
          v-model="note"
          class="ui-textarea"
          rows="2"
          :placeholder="t('app.car.ledger.notePlaceholder')"
          :disabled="saving"
        />
      </div>
    </form>

    <template #footer="{ close }">
      <div class="le__actions">
        <button type="button" class="ui-btn ui-btn--ghost" :disabled="saving" @click="close">
          {{ t('app.common.cancel') }}
        </button>
        <button type="submit" :form="formId" class="ui-btn ui-btn--primary" :disabled="saving">
          <span v-if="saving" class="ui-spinner" aria-hidden="true" />
          <span>{{ saving ? t('app.common.saving') : t('app.common.save') }}</span>
        </button>
      </div>
    </template>
  </BaseDialog>
</template>

<style scoped>
.le__toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: var(--radius-lg);
  background: var(--color-surface-mid);
}

.le__toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0.55rem;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-muted);
  transition: background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.le__toggle-btn--active {
  background: var(--color-bg);
  box-shadow: var(--shadow-ambient);
}

.le__toggle-btn--income.le__toggle-btn--active {
  color: var(--color-comply);
}

.le__toggle-btn--expense.le__toggle-btn--active {
  color: var(--color-risk);
}

.le__toggle-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.le__amount {
  position: relative;
  display: flex;
  align-items: center;
}

.le__currency {
  position: absolute;
  left: 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-muted);
  pointer-events: none;
}

.le__amount-input {
  padding-left: 3.1rem;
}

.le__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.le-fade-enter-active,
.le-fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.le-fade-enter-from,
.le-fade-leave-to {
  opacity: 0;
}

@media (max-width: 420px) {
  .le__actions {
    flex-direction: column-reverse;
  }
  .le__actions .ui-btn {
    width: 100%;
  }
}
</style>
