<script setup lang="ts">
import type { IconName } from '~/components/app/Icon.vue';

/**
 * Shared native-<dialog> shell: backdrop click + Escape to close, scrollable
 * body, pinned footer, pop-in motion with a reduced-motion fallback. Every
 * detail-screen dialog builds on this so the modal vocabulary stays identical.
 */
const props = withDefaults(
  defineProps<{
    title: string;
    titleId?: string;
    subtitle?: string;
    icon?: IconName;
    iconTone?: 'primary' | 'risk' | 'comply';
    width?: string;
  }>(),
  {
    iconTone: 'primary',
    width: 'min(92vw, 34rem)',
    titleId: undefined,
    subtitle: undefined,
    icon: undefined,
  },
);

const emit = defineEmits<{ close: [] }>();
const { t } = useI18n();

const dialog = ref<HTMLDialogElement | null>(null);
const headingId = computed(() => props.titleId ?? useId());

function open() {
  dialog.value?.showModal();
}

function close() {
  dialog.value?.close();
}

function onClose() {
  emit('close');
}

function onDialogClick(event: MouseEvent) {
  if (event.target === dialog.value) close();
}

defineExpose({ open, close });
</script>

<template>
  <dialog
    ref="dialog"
    class="bd"
    :style="{ '--bd-width': width }"
    :aria-labelledby="headingId"
    @click="onDialogClick"
    @close="onClose"
  >
    <div class="bd__panel">
      <header class="bd__head">
        <span
          v-if="icon"
          class="bd__head-icon"
          :data-tone="iconTone"
          aria-hidden="true"
        >
          <AppIcon :name="icon" :size="22" />
        </span>
        <div class="bd__head-copy">
          <h2 :id="headingId" class="bd__title">{{ title }}</h2>
          <p v-if="subtitle" class="bd__subtitle">{{ subtitle }}</p>
        </div>
        <button
          type="button"
          class="bd__close"
          :aria-label="t('app.common.close')"
          @click="close"
        >
          <AppIcon name="close" :size="20" />
        </button>
      </header>

      <div class="bd__body">
        <slot />
      </div>

      <footer v-if="$slots.footer" class="bd__foot">
        <slot name="footer" :close="close" />
      </footer>
    </div>
  </dialog>
</template>

<style scoped>
.bd {
  width: var(--bd-width);
  max-height: min(90dvh, 50rem);
  padding: 0;
  border: none;
  border-radius: var(--radius-xl);
  background: var(--color-bg);
  color: var(--color-ink);
  box-shadow: var(--shadow-float);
  overflow: visible;
}

.bd::backdrop {
  background: oklch(0.155 0.018 268 / 0.42);
  backdrop-filter: blur(2px);
}

.bd[open] {
  animation: bd-pop var(--duration-ui) var(--ease-out);
}

.bd[open]::backdrop {
  animation: bd-fade var(--duration-ui) var(--ease-out);
}

.bd__panel {
  display: flex;
  flex-direction: column;
  max-height: min(90dvh, 50rem);
}

.bd__head {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-6) var(--space-4);
}

.bd__head-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
}

.bd__head-icon[data-tone='primary'] {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}

.bd__head-icon[data-tone='risk'] {
  background: var(--color-risk-bg);
  color: var(--color-risk);
}

.bd__head-icon[data-tone='comply'] {
  background: var(--color-comply-bg);
  color: var(--color-comply);
}

.bd__head-copy {
  flex: 1;
  min-width: 0;
}

.bd__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--color-ink);
  text-wrap: balance;
}

.bd__subtitle {
  margin: 0.3rem 0 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-muted);
  text-wrap: pretty;
}

.bd__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  margin: -0.25rem -0.25rem 0 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-muted);
  transition: background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.bd__close:hover {
  background: var(--color-surface-mid);
  color: var(--color-ink);
}

.bd__close:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.bd__body {
  padding: 0 var(--space-6);
  overflow-y: auto;
}

.bd__foot {
  padding: var(--space-5) var(--space-6) var(--space-6);
}

@keyframes bd-pop {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes bd-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 540px) {
  .bd__head {
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }

  .bd__body {
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }

  .bd__foot {
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bd[open],
  .bd[open]::backdrop {
    animation: none;
  }
}
</style>
