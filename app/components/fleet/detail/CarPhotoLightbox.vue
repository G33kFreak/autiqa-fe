<script setup lang="ts">
import type { CarPhotoDto } from '#shared/dto/car-photo.dto';

const props = defineProps<{
  photos: CarPhotoDto[];
}>();

const emit = defineEmits<{
  'set-cover': [id: string];
  delete: [id: string];
}>();

const { t } = useI18n();
const dialog = ref<HTMLDialogElement | null>(null);
const index = ref(0);

const current = computed<CarPhotoDto | null>(() => props.photos[index.value] ?? null);

function openAt(i: number) {
  index.value = Math.max(0, Math.min(i, props.photos.length - 1));
  dialog.value?.showModal();
}

function close() {
  dialog.value?.close();
}

function prev() {
  if (props.photos.length < 2) return;
  index.value = (index.value - 1 + props.photos.length) % props.photos.length;
}

function next() {
  if (props.photos.length < 2) return;
  index.value = (index.value + 1) % props.photos.length;
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') prev();
  else if (event.key === 'ArrowRight') next();
}

// Keep the index valid as photos are added/removed; close when none remain.
watch(
  () => props.photos.length,
  (len) => {
    if (len === 0) {
      close();
      return;
    }
    if (index.value > len - 1) index.value = len - 1;
  },
);

defineExpose({ openAt });
</script>

<template>
  <dialog ref="dialog" class="lb" @keydown="onKey">
    <div v-if="current" class="lb__inner">
      <div class="lb__toolbar">
        <span class="lb__counter">{{ index + 1 }} / {{ photos.length }}</span>
        <div class="lb__tools">
          <button
            type="button"
            class="lb__tool"
            :class="{ 'lb__tool--on': current.isCover }"
            :aria-pressed="current.isCover"
            @click="emit('set-cover', current.id)"
          >
            <AppIcon name="star" :size="18" />
            <span>{{ current.isCover ? t('app.car.photos.coverSet') : t('app.car.photos.setCover') }}</span>
          </button>
          <button
            type="button"
            class="lb__tool lb__tool--danger"
            @click="emit('delete', current.id)"
          >
            <AppIcon name="trash" :size="18" />
            <span class="lb__tool-label">{{ t('app.common.delete') }}</span>
          </button>
          <button
            type="button"
            class="lb__tool lb__tool--icon"
            :aria-label="t('app.common.close')"
            @click="close"
          >
            <AppIcon name="close" :size="20" />
          </button>
        </div>
      </div>

      <div class="lb__stage">
        <button
          v-if="photos.length > 1"
          type="button"
          class="lb__nav lb__nav--prev"
          :aria-label="t('app.car.photos.previous')"
          @click="prev"
        >
          <AppIcon name="chevron-left" :size="24" />
        </button>

        <img :src="current.url" :alt="current.name" class="lb__image">

        <button
          v-if="photos.length > 1"
          type="button"
          class="lb__nav lb__nav--next"
          :aria-label="t('app.car.photos.next')"
          @click="next"
        >
          <AppIcon name="chevron-right" :size="24" />
        </button>
      </div>

      <p class="lb__caption">{{ current.name }}</p>
    </div>
  </dialog>
</template>

<style scoped>
.lb {
  width: 100vw;
  max-width: 100vw;
  height: 100dvh;
  max-height: 100dvh;
  margin: 0;
  padding: 0;
  border: none;
  background: oklch(0.12 0.018 268 / 0.96);
  color: var(--color-dark-ink);
}

.lb::backdrop {
  background: oklch(0.1 0.018 268 / 0.85);
}

.lb[open] {
  animation: lb-fade var(--duration-ui) var(--ease-out);
}

.lb__inner {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  padding: var(--space-4) var(--space-5) var(--space-5);
  gap: var(--space-3);
}

.lb__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.lb__counter {
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-dark-muted);
}

.lb__tools {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.lb__tool {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 2.25rem;
  padding: 0 var(--space-3);
  border: none;
  border-radius: var(--radius-md);
  background: oklch(1 0 0 / 0.1);
  color: var(--color-dark-ink);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  transition: background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.lb__tool:hover {
  background: oklch(1 0 0 / 0.18);
}

.lb__tool--on {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.lb__tool--danger:hover {
  background: var(--color-risk);
  color: var(--color-on-primary);
}

.lb__tool--icon {
  padding: 0;
  width: 2.25rem;
  justify-content: center;
}

.lb__tool:focus-visible {
  outline: 2px solid var(--color-dark-ink);
  outline-offset: 2px;
}

.lb__stage {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.lb__image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.lb__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: none;
  border-radius: var(--radius-full);
  background: oklch(1 0 0 / 0.12);
  color: var(--color-dark-ink);
  transition: background-color var(--duration-fast) var(--ease-out);
}

.lb__nav:hover {
  background: oklch(1 0 0 / 0.22);
}

.lb__nav:focus-visible {
  outline: 2px solid var(--color-dark-ink);
  outline-offset: 2px;
}

.lb__nav--prev {
  left: 0;
}

.lb__nav--next {
  right: 0;
}

.lb__caption {
  margin: 0;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-dark-muted);
}

@keyframes lb-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 540px) {
  .lb__tool-label {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lb[open] {
    animation: none;
  }
}
</style>
