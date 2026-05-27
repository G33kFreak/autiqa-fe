<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string;
    titleId: string;
    lead?: string;
    width?: string;
    maxHeight?: string;
    /** Scrollable body region; keep large enough for inline pickers. */
    bodyMaxHeight?: string;
  }>(),
  {
    lead: '',
    width: 'min(52rem, calc(100vw - 2rem))',
    maxHeight: 'min(92dvh, 58rem)',
    bodyMaxHeight: 'min(58dvh, 38rem)',
  },
);

const emit = defineEmits<{
  close: [];
}>();

const dialog = ref<HTMLDialogElement | null>(null);
let previousBodyOverflow = '';
let previousHtmlOverflow = '';
const isScrollLocked = ref(false);

function lockPageScroll() {
  if (typeof document === 'undefined' || isScrollLocked.value) return;
  previousBodyOverflow = document.body.style.overflow;
  previousHtmlOverflow = document.documentElement.style.overflow;
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  isScrollLocked.value = true;
}

function unlockPageScroll() {
  if (typeof document === 'undefined' || !isScrollLocked.value) return;
  document.body.style.overflow = previousBodyOverflow;
  document.documentElement.style.overflow = previousHtmlOverflow;
  isScrollLocked.value = false;
}

function showModal() {
  const el = dialog.value;
  if (!el || el.open) return;
  el.showModal();
  lockPageScroll();
}

function close() {
  if (!dialog.value?.open) return;
  dialog.value.close();
}

function handleClose() {
  unlockPageScroll();
  emit('close');
}

function handleDialogClick(event: MouseEvent) {
  if (event.target !== dialog.value) return;
  close();
}

onBeforeUnmount(() => {
  unlockPageScroll();
});

defineExpose({ showModal, close });
</script>

<template>
  <dialog
    ref="dialog"
    class="entity-dialog-shell"
    :aria-labelledby="titleId"
    :style="{ width, maxHeight }"
    @click="handleDialogClick"
    @close="handleClose"
  >
    <div class="entity-dialog-shell__shell">
      <header class="entity-dialog-shell__header">
        <div class="entity-dialog-shell__intro">
          <h2 :id="titleId" class="entity-dialog-shell__title">{{ title }}</h2>
          <p v-if="lead" class="entity-dialog-shell__lead">{{ lead }}</p>
        </div>
        <button
          type="button"
          class="entity-dialog-shell__close"
          :aria-label="$t('common.close')"
          @click="close"
        >
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      </header>

      <section
        class="entity-dialog-shell__body"
        :style="{ maxHeight: bodyMaxHeight }"
      >
        <slot name="body" />
      </section>

      <footer v-if="$slots.footer" class="entity-dialog-shell__footer">
        <slot name="footer" />
      </footer>
    </div>
  </dialog>
</template>

<style scoped>
.entity-dialog-shell {
  border: none;
  padding: 0;
  background: transparent;
  max-width: calc(100vw - 1rem);
}

.entity-dialog-shell::backdrop {
  background: color-mix(in srgb, var(--color-inverse-surface) 48%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.entity-dialog-shell__shell {
  border-radius: 1rem;
  background: var(--color-surface-container-low);
  box-shadow:
    0 24px 48px color-mix(in srgb, var(--color-inverse-surface) 14%, transparent),
    0 0 0 1px color-mix(in srgb, var(--color-outline-variant) 12%, transparent);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@media (prefers-reduced-motion: no-preference) {
  .entity-dialog-shell[open] .entity-dialog-shell__shell {
    animation: entity-dialog-enter 240ms var(--app-ease-out, cubic-bezier(0.23, 1, 0.32, 1)) both;
  }
}

@keyframes entity-dialog-enter {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.entity-dialog-shell__header {
  padding: 1.35rem 1.5rem 1.15rem;
  background: var(--color-surface-container-lowest);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.entity-dialog-shell__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 2.5vw, 1.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-on-surface);
  line-height: 1.1;
}

.entity-dialog-shell__lead {
  margin: 0.45rem 0 0;
  max-width: 36rem;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.5;
  color: var(--color-on-surface-variant);
}

.entity-dialog-shell__close {
  flex-shrink: 0;
  border: none;
  border-radius: 0.65rem;
  width: 2.25rem;
  height: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-container-low);
  color: var(--color-on-surface-variant);
  cursor: pointer;
  transition:
    background-color var(--app-duration-fast, 160ms) var(--app-ease-out, ease),
    color var(--app-duration-fast, 160ms) var(--app-ease-out, ease),
    transform var(--app-duration-fast, 160ms) var(--app-ease-out, ease);
}

.entity-dialog-shell__close:active {
  transform: scale(0.94);
}

@media (hover: hover) and (pointer: fine) {
  .entity-dialog-shell__close:hover {
    background: var(--color-surface-container-high);
    color: var(--color-on-surface);
  }
}

.entity-dialog-shell__body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  background: var(--color-surface-container-low);
}

.entity-dialog-shell__footer {
  padding: 1rem 1.5rem 1.25rem;
  background: var(--color-surface-container-lowest);
}
</style>
