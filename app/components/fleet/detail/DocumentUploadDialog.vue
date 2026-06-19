<script setup lang="ts">
import {
  CAR_DOCUMENT_CATEGORIES,
  type CarDocumentCategory,
} from '#shared/dto/car-document.dto';
import BaseDialog from '~/components/app/BaseDialog.vue';
import { dateInputToIso, formatBytes } from '~/utils/format';

const props = defineProps<{
  submit: (payload: {
    file: File;
    category: CarDocumentCategory;
    expiresAt: string | null;
  }) => Promise<void>;
}>();

const { t } = useI18n();
const dialog = ref<InstanceType<typeof BaseDialog> | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const formId = useId();

const file = ref<File | null>(null);
const category = ref<CarDocumentCategory>('registration');
const expiresAt = ref('');
const dragging = ref(false);
const fileError = ref(false);
const saving = ref(false);
const error = ref('');

function open() {
  file.value = null;
  category.value = 'registration';
  expiresAt.value = '';
  dragging.value = false;
  fileError.value = false;
  error.value = '';
  dialog.value?.open();
}

function pickFile() {
  fileInput.value?.click();
}

function onFileChange(event: Event) {
  const selected = (event.target as HTMLInputElement).files?.[0] ?? null;
  if (selected) {
    file.value = selected;
    fileError.value = false;
  }
}

function onDrop(event: DragEvent) {
  dragging.value = false;
  const dropped = event.dataTransfer?.files?.[0] ?? null;
  if (dropped) {
    file.value = dropped;
    fileError.value = false;
  }
}

async function onSubmit() {
  error.value = '';
  if (!file.value) {
    fileError.value = true;
    return;
  }
  saving.value = true;
  try {
    await props.submit({
      file: file.value,
      category: category.value,
      expiresAt: expiresAt.value ? dateInputToIso(expiresAt.value) : null,
    });
    dialog.value?.close();
  } catch {
    error.value = t('app.car.documents.error');
  } finally {
    saving.value = false;
  }
}

defineExpose({ open });
</script>

<template>
  <BaseDialog
    ref="dialog"
    :title="t('app.car.documents.addTitle')"
    :subtitle="t('app.car.documents.subtitle')"
    icon="document"
  >
    <form :id="formId" class="ui-form" novalidate @submit.prevent="onSubmit">
      <Transition name="du-fade">
        <p v-if="error" class="ui-banner ui-banner--error" role="alert">
          <AppIcon name="alert" :size="16" />
          <span>{{ error }}</span>
        </p>
      </Transition>

      <button
        type="button"
        class="du__drop"
        :class="{ 'du__drop--active': dragging, 'du__drop--error': fileError }"
        @click="pickFile"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="onDrop"
      >
        <span class="du__drop-icon" aria-hidden="true">
          <AppIcon :name="file ? 'document' : 'upload'" :size="24" />
        </span>
        <template v-if="file">
          <span class="du__file-name">{{ file.name }}</span>
          <span class="du__file-meta">{{ formatBytes(file.size) }} · {{ t('app.car.documents.replace') }}</span>
        </template>
        <template v-else>
          <span class="du__drop-title">{{ t('app.car.documents.dropTitle') }}</span>
          <span class="du__drop-hint">{{ t('app.car.documents.dropHint') }}</span>
        </template>
      </button>
      <input
        ref="fileInput"
        type="file"
        class="ui-sr"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx"
        @change="onFileChange"
      >
      <p v-if="fileError" class="ui-hint ui-hint--error">
        {{ t('app.car.documents.fileRequired') }}
      </p>

      <div class="ui-grid-2">
        <div class="ui-field">
          <label class="ui-label" :for="`${formId}-category`">
            {{ t('app.car.documents.categoryLabel') }}
          </label>
          <select
            :id="`${formId}-category`"
            v-model="category"
            class="ui-select"
            :disabled="saving"
          >
            <option v-for="c in CAR_DOCUMENT_CATEGORIES" :key="c" :value="c">
              {{ t(`app.car.documents.categories.${c}`) }}
            </option>
          </select>
        </div>
        <div class="ui-field">
          <label class="ui-label" :for="`${formId}-expires`">
            {{ t('app.car.documents.expiresLabel') }}
          </label>
          <input
            :id="`${formId}-expires`"
            v-model="expiresAt"
            type="date"
            class="ui-input"
            :disabled="saving"
          >
        </div>
      </div>
    </form>

    <template #footer="{ close }">
      <div class="du__actions">
        <button type="button" class="ui-btn ui-btn--ghost" :disabled="saving" @click="close">
          {{ t('app.common.cancel') }}
        </button>
        <button type="submit" :form="formId" class="ui-btn ui-btn--primary" :disabled="saving">
          <span v-if="saving" class="ui-spinner" aria-hidden="true" />
          <span>{{ saving ? t('app.car.documents.uploading') : t('app.car.documents.upload') }}</span>
        </button>
      </div>
    </template>
  </BaseDialog>
</template>

<style scoped>
.du__drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  width: 100%;
  padding: var(--space-8) var(--space-4);
  border: 1.5px dashed var(--color-outline);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  text-align: center;
  transition: border-color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.du__drop:hover,
.du__drop--active {
  border-color: var(--color-primary);
  background: var(--color-primary-subtle);
}

.du__drop--error {
  border-color: var(--color-risk);
}

.du__drop:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.du__drop-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.du__drop-title,
.du__file-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.du__drop-hint,
.du__file-meta {
  font-size: 0.8125rem;
  color: var(--color-muted);
}

.du__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.du-fade-enter-active,
.du-fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.du-fade-enter-from,
.du-fade-leave-to {
  opacity: 0;
}

@media (max-width: 420px) {
  .du__actions {
    flex-direction: column-reverse;
  }
  .du__actions .ui-btn {
    width: 100%;
  }
}
</style>
