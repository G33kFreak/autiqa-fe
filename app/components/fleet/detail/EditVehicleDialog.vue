<script setup lang="ts">
import type { CarDto } from '#shared/dto/car.dto';
import BaseDialog from '~/components/app/BaseDialog.vue';

const props = defineProps<{
  car: CarDto | null;
  submit: (patch: { model: string; plateNumber: string; vin: string }) => Promise<void>;
}>();

const { t } = useI18n();
const dialog = ref<InstanceType<typeof BaseDialog> | null>(null);
const modelInput = ref<HTMLInputElement | null>(null);
const formId = useId();

const model = ref('');
const plateNumber = ref('');
const vin = ref('');
const modelError = ref(false);
const saving = ref(false);
const error = ref('');

function open() {
  model.value = props.car?.model ?? '';
  plateNumber.value = props.car?.plateNumber ?? '';
  vin.value = props.car?.vin ?? '';
  modelError.value = false;
  error.value = '';
  dialog.value?.open();
  nextTick(() => modelInput.value?.focus());
}

function onUpper(ref_: typeof plateNumber, event: Event) {
  ref_.value = (event.target as HTMLInputElement).value.toUpperCase();
}

async function onSubmit() {
  error.value = '';
  if (!model.value.trim()) {
    modelError.value = true;
    modelInput.value?.focus();
    return;
  }
  saving.value = true;
  try {
    await props.submit({
      model: model.value.trim(),
      plateNumber: plateNumber.value.trim(),
      vin: vin.value.trim(),
    });
    dialog.value?.close();
  } catch {
    error.value = t('app.car.editVehicle.error');
  } finally {
    saving.value = false;
  }
}

defineExpose({ open });
</script>

<template>
  <BaseDialog
    ref="dialog"
    :title="t('app.car.editVehicle.title')"
    :subtitle="t('app.car.editVehicle.subtitle')"
    icon="edit"
  >
    <form :id="formId" class="ui-form" novalidate @submit.prevent="onSubmit">
      <Transition name="ev-fade">
        <p v-if="error" class="ui-banner ui-banner--error" role="alert">
          <AppIcon name="alert" :size="16" />
          <span>{{ error }}</span>
        </p>
      </Transition>

      <div class="ui-field">
        <label class="ui-label" :for="`${formId}-model`">
          {{ t('app.car.editVehicle.modelLabel') }}
          <span class="ui-req" aria-hidden="true">*</span>
        </label>
        <input
          :id="`${formId}-model`"
          ref="modelInput"
          v-model="model"
          type="text"
          class="ui-input"
          :class="{ 'ui-input--error': modelError }"
          :aria-invalid="modelError"
          maxlength="80"
          autocomplete="off"
          :disabled="saving"
          @input="modelError = false"
        >
        <p v-if="modelError" class="ui-hint ui-hint--error">
          {{ t('app.car.editVehicle.modelRequired') }}
        </p>
      </div>

      <div class="ui-grid-2">
        <div class="ui-field">
          <label class="ui-label" :for="`${formId}-plate`">
            {{ t('app.car.editVehicle.plateLabel') }}
          </label>
          <input
            :id="`${formId}-plate`"
            :value="plateNumber"
            type="text"
            class="ui-input ui-input--mono"
            maxlength="16"
            autocomplete="off"
            :disabled="saving"
            @input="onUpper(plateNumber, $event)"
          >
        </div>
        <div class="ui-field">
          <label class="ui-label" :for="`${formId}-vin`">
            {{ t('app.car.editVehicle.vinLabel') }}
          </label>
          <input
            :id="`${formId}-vin`"
            :value="vin"
            type="text"
            class="ui-input ui-input--mono"
            maxlength="17"
            autocomplete="off"
            :disabled="saving"
            @input="onUpper(vin, $event)"
          >
        </div>
      </div>
    </form>

    <template #footer="{ close }">
      <div class="ev__actions">
        <button
          type="button"
          class="ui-btn ui-btn--ghost"
          :disabled="saving"
          @click="close"
        >
          {{ t('app.common.cancel') }}
        </button>
        <button
          type="submit"
          :form="formId"
          class="ui-btn ui-btn--primary"
          :disabled="saving"
        >
          <span v-if="saving" class="ui-spinner" aria-hidden="true" />
          <span>{{ saving ? t('app.common.saving') : t('app.common.save') }}</span>
        </button>
      </div>
    </template>
  </BaseDialog>
</template>

<style scoped>
.ev__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.ev-fade-enter-active,
.ev-fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.ev-fade-enter-from,
.ev-fade-leave-to {
  opacity: 0;
}

@media (max-width: 420px) {
  .ev__actions {
    flex-direction: column-reverse;
  }
  .ev__actions .ui-btn {
    width: 100%;
  }
}
</style>
