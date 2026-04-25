<script setup lang="ts">
import {
  ACCEPTED_FILE_FORMATS_LABEL,
  ACCEPTED_FILE_INPUT_ATTR,
  MAX_UPLOAD_FILE_SIZE_BYTES,
  isAcceptedFileType,
} from '~/utils/file-upload';
const { t } = useI18n();

export type DriverDocumentView = {
  id?: string;
  name: string;
  size: number | null;
  mimeType: string | null;
  url?: string | null;
};

const props = defineProps<{
  documents: DriverDocumentView[];
  isUploading?: boolean;
  uploadSuccessNonce?: number;
  deletingDocumentId?: string | null;
  openingDocumentId?: string | null;
}>();

const emit = defineEmits<{
  upload: [files: File[]];
  deleteDocument: [docId: string];
  openDocument: [docId: string];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);
const validationError = ref('');
const pendingFiles = ref<File[]>([]);

function formatSize(size: number | null): string {
  if (!size || size <= 0) return t('appSections.drivers.details.documents.unknownSize');
  const kb = size / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function iconClassByMime(mimeType: string | null): string {
  if (!mimeType) return 'driver-documents__file-icon--image';
  if (mimeType.includes('pdf')) return 'driver-documents__file-icon--pdf';
  return 'driver-documents__file-icon--image';
}

function iconNameByMime(mimeType: string | null): string {
  if (!mimeType) return 'description';
  if (mimeType.includes('pdf')) return 'picture_as_pdf';
  if (mimeType.startsWith('image/')) return 'image';
  return 'description';
}

function openPicker() {
  fileInput.value?.click();
}

function validateFiles(files: File[]): File[] {
  if (files.length === 0) {
    validationError.value = t('appSections.drivers.details.documents.validation.selectAtLeastOne');
    return [];
  }
  const unsupported = files.find((file) => !isAcceptedFileType(file));
  if (unsupported) {
    validationError.value = t(
      'appSections.drivers.details.documents.validation.unsupportedFormat',
      { formats: ACCEPTED_FILE_FORMATS_LABEL },
    );
    return [];
  }
  const tooLarge = files.find((file) => file.size > MAX_UPLOAD_FILE_SIZE_BYTES);
  if (tooLarge) {
    validationError.value = t('appSections.drivers.details.documents.validation.maxSize');
    return [];
  }
  validationError.value = '';
  return files;
}

function addPendingFiles(files: File[]) {
  const valid = validateFiles(files);
  if (valid.length === 0) return;
  const existingKeys = new Set(
    pendingFiles.value.map((file) => `${file.name}-${file.size}-${file.type}`),
  );
  const unique = valid.filter((file) => {
    const key = `${file.name}-${file.size}-${file.type}`;
    if (existingKeys.has(key)) return false;
    existingKeys.add(key);
    return true;
  });
  pendingFiles.value = [...pendingFiles.value, ...unique];
}

function removePendingFile(index: number) {
  pendingFiles.value = pendingFiles.value.filter((_, i) => i !== index);
}

function clearPendingFiles() {
  pendingFiles.value = [];
}

function savePendingFiles() {
  if (pendingFiles.value.length === 0 || props.isUploading) return;
  emit('upload', [...pendingFiles.value]);
}

function onInputChange(event: Event) {
  const el = event.target as HTMLInputElement;
  const files = Array.from(el.files ?? []);
  addPendingFiles(files);
  el.value = '';
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = false;
  const files = Array.from(event.dataTransfer?.files ?? []);
  addPendingFiles(files);
}

function onDragOver(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = true;
}

function onDragLeave() {
  isDragOver.value = false;
}

watch(
  () => props.uploadSuccessNonce,
  () => {
    pendingFiles.value = [];
    validationError.value = '';
  },
);
</script>

<template>
  <article class="driver-card">
    <h2 class="driver-card__title">
      <span class="material-symbols-outlined" aria-hidden="true">description</span>
      {{ t('appSections.drivers.details.documents.title') }}
    </h2>
    <div
      class="driver-documents__dropzone"
      :class="{ 'driver-documents__dropzone--active': isDragOver }"
      role="button"
      tabindex="0"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @drop="onDrop"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        :accept="ACCEPTED_FILE_INPUT_ATTR"
        class="driver-documents__input"
        @change="onInputChange"
      >
      <div class="driver-documents__dropzone-icon">
        <span class="material-symbols-outlined" aria-hidden="true">cloud_upload</span>
      </div>
      <p>
        {{
          props.isUploading
            ? t('appSections.drivers.details.documents.uploading')
            : t('appSections.drivers.details.documents.dropzoneHint')
        }}
      </p>
      <small>
        {{ t('appSections.drivers.details.documents.supportedFormats', { formats: ACCEPTED_FILE_FORMATS_LABEL }) }}
      </small>
      <button
        type="button"
        :disabled="props.isUploading"
        @click.stop="openPicker"
      >
        {{ t('appSections.drivers.details.documents.browse') }}
      </button>
      <small v-if="validationError" class="driver-documents__error">{{ validationError }}</small>
    </div>

    <div v-if="pendingFiles.length > 0" class="driver-documents__pending">
      <h3>{{ t('appSections.drivers.details.documents.selectedFiles') }}</h3>
      <div
        v-for="(file, index) in pendingFiles"
        :key="`${file.name}-${file.size}-${index}`"
        class="driver-documents__file-item"
      >
        <div class="driver-documents__file-meta">
          <div class="driver-documents__file-icon" :class="iconClassByMime(file.type)">
            <span class="material-symbols-outlined" aria-hidden="true">{{ iconNameByMime(file.type) }}</span>
          </div>
          <div>
            <p>{{ file.name }}</p>
            <small>{{ formatSize(file.size) }} • {{ file.type || t('appSections.drivers.details.documents.unknownType') }}</small>
          </div>
        </div>
        <button
          type="button"
          class="driver-documents__pending-remove"
          :disabled="props.isUploading"
          @click="removePendingFile(index)"
        >
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      </div>
      <div class="driver-documents__pending-actions">
        <button
          type="button"
          class="driver-documents__pending-btn driver-documents__pending-btn--ghost"
          :disabled="props.isUploading"
          @click="clearPendingFiles"
        >
          {{ t('appSections.drivers.details.documents.clear') }}
        </button>
        <button
          type="button"
          class="driver-documents__pending-btn driver-documents__pending-btn--primary"
          :disabled="props.isUploading || pendingFiles.length === 0"
          @click="savePendingFiles"
        >
          {{
            props.isUploading
              ? t('appSections.drivers.details.documents.saving')
              : t('appSections.drivers.details.documents.save')
          }}
        </button>
      </div>
    </div>

    <div class="driver-documents__files">
      <h3>{{ t('appSections.drivers.details.documents.uploadedFiles') }}</h3>
      <p v-if="props.documents.length === 0" class="driver-documents__empty">
        {{ t('appSections.drivers.details.documents.empty') }}
      </p>
      <div
        v-for="document in props.documents"
        v-else
        :key="document.id || `${document.name}-${document.size}`"
        class="driver-documents__file-item"
        :class="{ 'driver-documents__file-item--clickable': Boolean(document.id) }"
        :role="document.id ? 'button' : undefined"
        :tabindex="document.id ? 0 : undefined"
        @click="document.id && emit('openDocument', document.id)"
        @keydown.enter.prevent="document.id && emit('openDocument', document.id)"
        @keydown.space.prevent="document.id && emit('openDocument', document.id)"
      >
        <div class="driver-documents__file-meta">
          <div class="driver-documents__file-icon" :class="iconClassByMime(document.mimeType)">
            <span class="material-symbols-outlined" aria-hidden="true">{{ iconNameByMime(document.mimeType) }}</span>
          </div>
          <div>
            <p>{{ document.name }}</p>
            <small>{{ formatSize(document.size) }} • {{ document.mimeType || t('appSections.drivers.details.documents.unknownType') }}</small>
          </div>
        </div>
        <div v-if="document.id" class="driver-documents__file-actions">
          <button
            type="button"
            class="driver-documents__file-open"
            :disabled="props.isUploading || props.openingDocumentId === document.id"
            @click.stop="emit('openDocument', document.id)"
          >
            <span class="material-symbols-outlined" aria-hidden="true">
              {{ props.openingDocumentId === document.id ? 'progress_activity' : 'open_in_new' }}
            </span>
          </button>
          <button
            type="button"
            class="driver-documents__file-delete"
            :disabled="props.isUploading || props.deletingDocumentId === document.id"
            @click.stop="emit('deleteDocument', document.id)"
          >
            <span class="material-symbols-outlined" aria-hidden="true">
              {{ props.deletingDocumentId === document.id ? 'progress_activity' : 'delete' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.driver-card {
  border-radius: 1rem;
  padding: 1.4rem;
  background: var(--color-surface-container-low);
}

.driver-card__title {
  margin: 0 0 1.1rem;
  color: var(--color-on-surface);
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.driver-card__title :deep(.material-symbols-outlined) {
  color: var(--color-outline);
  font-size: 1.15rem;
}

.driver-documents__dropzone {
  border: 2px dashed color-mix(in srgb, var(--color-outline-variant) 45%, transparent);
  border-radius: 0.85rem;
  padding: 2rem 1rem;
  background: color-mix(in srgb, var(--color-surface-container-lowest) 60%, transparent);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.35rem;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.18s ease;
}

.driver-documents__dropzone--active {
  background: var(--color-surface-container-lowest);
  border-color: color-mix(in srgb, var(--color-secondary) 45%, var(--color-outline-variant));
}

.driver-documents__input {
  display: none;
}

.driver-documents__dropzone:hover {
  background: var(--color-surface-container-lowest);
  border-color: color-mix(in srgb, var(--color-secondary) 30%, var(--color-outline-variant));
  transform: translateY(-1px);
}

.driver-documents__dropzone:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-secondary) 30%, transparent);
}

.driver-documents__dropzone-icon {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-secondary-fixed) 60%, transparent);
  color: var(--color-secondary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.2rem;
}

.driver-documents__dropzone p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-on-surface);
  font-weight: 600;
}

.driver-documents__dropzone small {
  color: var(--color-on-surface-variant);
  font-size: 0.75rem;
  margin-bottom: 0.2rem;
}

.driver-documents__dropzone button {
  border: none;
  border-radius: 0.55rem;
  padding: 0.5rem 0.8rem;
  font-size: 0.8125rem;
  font-weight: 700;
  background: var(--color-surface-container-high);
  color: var(--color-on-surface);
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.driver-documents__dropzone button:hover {
  background: var(--color-surface-container);
  transform: translateY(-1px);
}

.driver-documents__dropzone button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-secondary) 30%, transparent);
}

.driver-documents__error {
  margin-top: 0.15rem;
  color: var(--color-error);
  font-weight: 600;
}

.driver-documents__pending {
  margin-top: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.driver-documents__files {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.driver-documents__files h3 {
  margin: 0 0 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.6875rem;
  color: var(--color-outline);
}

.driver-documents__empty {
  margin: 0;
  color: var(--color-on-surface-variant);
  font-size: 0.8125rem;
}

.driver-documents__file-item {
  padding: 0.7rem;
  border-radius: 0.75rem;
  background: var(--color-surface-container-lowest);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  transition:
    background-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.driver-documents__file-item--clickable {
  cursor: pointer;
}

.driver-documents__file-item--clickable:hover {
  background: var(--color-surface-container);
  transform: translateY(-1px);
}

.driver-documents__file-item--clickable:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-secondary) 30%, transparent);
}

.driver-documents__file-delete {
  border: none;
  border-radius: 999px;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--color-on-surface-variant);
  cursor: pointer;
}

.driver-documents__file-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.driver-documents__file-open {
  border: none;
  border-radius: 999px;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--color-on-surface-variant);
  cursor: pointer;
}

.driver-documents__file-open:hover:not(:disabled) {
  color: var(--color-secondary-container);
  background: color-mix(in srgb, var(--color-secondary-fixed) 55%, transparent);
}

.driver-documents__file-open:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.driver-documents__file-delete:hover:not(:disabled) {
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-error-container) 55%, transparent);
}

.driver-documents__file-delete:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.driver-documents__pending-remove {
  border: none;
  border-radius: 999px;
  width: 1.9rem;
  height: 1.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--color-on-surface-variant);
  cursor: pointer;
}

.driver-documents__pending-remove:hover:not(:disabled) {
  background: var(--color-surface-container-high);
  color: var(--color-on-surface);
}

.driver-documents__pending-actions {
  margin-top: 0.2rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.45rem;
}

.driver-documents__pending-btn {
  border: none;
  border-radius: 0.6rem;
  padding: 0.45rem 0.78rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.driver-documents__pending-btn--ghost {
  background: var(--color-surface-container-high);
  color: var(--color-on-surface);
}

.driver-documents__pending-btn--ghost:hover:not(:disabled) {
  background: var(--color-surface-container);
}

.driver-documents__pending-btn--primary {
  background: var(--color-secondary);
  color: var(--color-on-secondary);
}

.driver-documents__pending-btn--primary:hover:not(:disabled) {
  opacity: 0.94;
}

.driver-documents__pending-btn:disabled,
.driver-documents__pending-remove:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.driver-documents__file-meta {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.driver-documents__file-meta p {
  margin: 0;
  color: var(--color-on-surface);
  font-size: 0.875rem;
  font-weight: 600;
}

.driver-documents__file-meta small {
  color: var(--color-on-surface-variant);
  font-size: 0.75rem;
}

.driver-documents__file-icon {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 0.55rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.driver-documents__file-icon--pdf {
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-error-container) 65%, transparent);
}

.driver-documents__file-icon--image {
  color: var(--color-tertiary);
  background: color-mix(in srgb, var(--color-tertiary-fixed) 40%, transparent);
}

</style>
