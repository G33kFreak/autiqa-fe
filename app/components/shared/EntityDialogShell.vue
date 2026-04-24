<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string;
  titleId: string;
  lead?: string;
  width?: string;
  maxHeight?: string;
}>(), {
  lead: '',
  width: 'min(52rem, calc(100vw - 2rem))',
  maxHeight: 'min(92dvh, 58rem)',
});

const emit = defineEmits<{
  close: [];
}>();

const dialog = ref<HTMLDialogElement | null>(null);

function showModal() {
  dialog.value?.showModal();
}

function close() {
  dialog.value?.close();
}

defineExpose({ showModal, close });
</script>

<template>
  <dialog
    ref="dialog"
    class="entity-dialog-shell"
    :aria-labelledby="titleId"
    :style="{ width, maxHeight }"
    @close="emit('close')"
  >
    <div class="entity-dialog-shell__shell">
      <header class="entity-dialog-shell__header">
        <div>
          <h2 :id="titleId" class="entity-dialog-shell__title">{{ title }}</h2>
          <p v-if="lead" class="entity-dialog-shell__lead">{{ lead }}</p>
        </div>
        <button type="button" class="entity-dialog-shell__icon-btn" @click="close">
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      </header>

      <section class="entity-dialog-shell__body">
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
  border-radius: 0.75rem;
  padding: 0;
  background: transparent;
}

.entity-dialog-shell::backdrop {
  background: color-mix(in srgb, var(--color-inverse-surface) 42%, transparent);
  backdrop-filter: blur(10px);
}

.entity-dialog-shell__shell {
  border-radius: 0.75rem;
  background: var(--color-surface);
  box-shadow: 0 24px 48px rgb(25 28 30 / 0.15);
  overflow: hidden;
}

.entity-dialog-shell__header {
  padding: 1.35rem 1.75rem 1.15rem;
  background: var(--color-surface-container-low);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
}

.entity-dialog-shell__header::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: var(--color-surface-container-highest);
}

.entity-dialog-shell__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--color-on-surface);
}

.entity-dialog-shell__lead {
  margin: 0.2rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-on-surface-variant);
}

.entity-dialog-shell__icon-btn {
  border: none;
  border-radius: 0.75rem;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--color-on-surface-variant);
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.entity-dialog-shell__icon-btn:hover {
  background: var(--color-surface-container-high);
  color: var(--color-on-surface);
}

.entity-dialog-shell__body {
  padding: 1.35rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  max-height: min(58dvh, 38rem);
}

.entity-dialog-shell__footer {
  padding: 1rem 1.75rem 1.2rem;
  background: var(--color-surface-container-low);
  display: flex;
  justify-content: flex-end;
  gap: 0.55rem;
  position: relative;
}

.entity-dialog-shell__footer::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
  background: var(--color-surface-container-highest);
}
</style>
