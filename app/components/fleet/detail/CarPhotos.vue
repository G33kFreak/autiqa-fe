<script setup lang="ts">
import type { CarPhotoDto } from '#shared/dto/car-photo.dto';

defineProps<{
  photos: CarPhotoDto[];
  uploading?: boolean;
  isPending: (id: string) => boolean;
}>();

const emit = defineEmits<{
  upload: [files: File[]];
  open: [index: number];
  'set-cover': [id: string];
  delete: [id: string];
}>();

const { t, tm, rt } = useI18n();
const fileInput = ref<HTMLInputElement | null>(null);
const dragging = ref(false);

const emptyHints = computed(() => tm('app.car.photos.emptyHints').map((h) => rt(h)));

function pick() {
  fileInput.value?.click();
}

function emitFiles(list: FileList | null | undefined) {
  const files = Array.from(list ?? []).filter((f) => f.type.startsWith('image/'));
  if (files.length) emit('upload', files);
}

function onFileChange(event: Event) {
  emitFiles((event.target as HTMLInputElement).files);
  (event.target as HTMLInputElement).value = '';
}

function onDrop(event: DragEvent) {
  dragging.value = false;
  emitFiles(event.dataTransfer?.files);
}
</script>

<template>
  <section
    class="ph"
    aria-labelledby="ph-title"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
  >
    <div class="ui-section-head">
      <div>
        <h2 id="ph-title" class="ui-section-title">{{ t('app.car.photos.title') }}</h2>
        <p class="ui-section-sub">{{ t('app.car.photos.subtitle') }}</p>
      </div>
      <button
        type="button"
        class="ui-btn ui-btn--primary ui-btn--sm"
        :disabled="uploading"
        @click="pick"
      >
        <span v-if="uploading" class="ui-spinner" aria-hidden="true" />
        <AppIcon v-else name="upload" :size="18" />
        <span>{{ uploading ? t('app.car.photos.uploading') : t('app.car.photos.upload') }}</span>
      </button>
    </div>

    <input
      ref="fileInput"
      type="file"
      class="ui-sr"
      accept="image/*"
      multiple
      @change="onFileChange"
    >

    <AppEmptyState
      v-if="photos.length === 0"
      icon="image"
      variant="dashed"
      :active="dragging"
      :title="t('app.car.photos.emptyTitle')"
      :body="t('app.car.photos.emptyBody')"
      :hints="emptyHints"
      :hints-label="t('app.car.common.examplesLabel')"
    >
      <button type="button" class="ui-btn ui-btn--primary ui-btn--sm" :disabled="uploading" @click="pick">
        <AppIcon name="upload" :size="16" />
        <span>{{ t('app.car.photos.upload') }}</span>
      </button>
    </AppEmptyState>

    <div v-else class="ph__grid" :class="{ 'ph__grid--drag': dragging }">
      <figure v-for="(photo, i) in photos" :key="photo.id" class="ph__cell">
        <button
          type="button"
          class="ph__open"
          :aria-label="t('app.car.photos.view', { name: photo.name })"
          @click="emit('open', i)"
        >
          <img :src="photo.thumbnailUrl || photo.url" :alt="photo.name" loading="lazy">
        </button>

        <span v-if="photo.isCover" class="ph__cover-badge">
          <AppIcon name="star" :size="13" />
          {{ t('app.car.photos.cover') }}
        </span>

        <div class="ph__actions">
          <button
            v-if="!photo.isCover"
            type="button"
            class="ph__action"
            :aria-label="t('app.car.photos.setCover')"
            :disabled="isPending(photo.id)"
            @click="emit('set-cover', photo.id)"
          >
            <AppIcon name="star" :size="16" />
          </button>
          <button
            type="button"
            class="ph__action ph__action--danger"
            :aria-label="t('app.common.delete')"
            :disabled="isPending(photo.id)"
            @click="emit('delete', photo.id)"
          >
            <span v-if="isPending(photo.id)" class="ui-spinner" aria-hidden="true" />
            <AppIcon v-else name="trash" :size="16" />
          </button>
        </div>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.ph__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: var(--space-3);
  border-radius: var(--radius-lg);
  transition: outline-color var(--duration-fast) var(--ease-out);
  outline: 2px dashed transparent;
  outline-offset: 4px;
}

.ph__grid--drag {
  outline-color: var(--color-primary);
}

.ph__cell {
  position: relative;
  margin: 0;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface-mid);
}

.ph__open {
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: none;
}

.ph__open img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-slow) var(--ease-out);
}

.ph__open:hover img {
  transform: scale(1.04);
}

.ph__open:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.ph__cover-badge {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.ph__actions {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.ph__cell:hover .ph__actions,
.ph__cell:focus-within .ph__actions {
  opacity: 1;
  transform: translateY(0);
}

.ph__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: var(--radius-sm);
  background: oklch(1 0 0 / 0.92);
  color: var(--color-ink);
  box-shadow: var(--shadow-ambient);
  transition: background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.ph__action:hover:not(:disabled) {
  background: var(--color-bg);
  color: var(--color-primary);
}

.ph__action--danger:hover:not(:disabled) {
  color: var(--color-risk);
}

.ph__action:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.ph__action:disabled {
  cursor: not-allowed;
}

@media (hover: none) {
  /* Touch: actions always visible. */
  .ph__actions {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ph__open img,
  .ph__actions {
    transition: none;
  }
  .ph__open:hover img {
    transform: none;
  }
}
</style>
