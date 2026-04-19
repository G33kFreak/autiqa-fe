<script setup lang="ts">
const { t } = useI18n();

withDefaults(
  defineProps<{
    /** Stacking order for fixed overlay (e.g. above app chrome). */
    zIndex?: number;
    /** Accessible name (defaults to translated `common.loading`). */
    ariaLabel?: string;
  }>(),
  {
    zIndex: 50,
  },
);
</script>

<template>
  <div
    class="ti-full-screen-loader"
    role="status"
    aria-live="polite"
    aria-busy="true"
    :aria-label="ariaLabel ?? t('common.loading')"
    :style="{ zIndex }"
  >
    <svg
      class="ti-full-screen-loader__spinner"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        class="ti-full-screen-loader__track"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="1.5"
      />
      <circle
        class="ti-full-screen-loader__arc"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
    <slot />
  </div>
</template>

<style scoped>
.ti-full-screen-loader {
  position: fixed;
  inset: 0;
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--color-surface);
  color: var(--color-secondary);
}

.ti-full-screen-loader__spinner {
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  transform-origin: center;
  animation: ti-full-screen-loader-spin 0.85s linear infinite;
}

.ti-full-screen-loader__track {
  opacity: 0.2;
}

.ti-full-screen-loader__arc {
  stroke-dasharray: 42 63;
  transform-origin: 12px 12px;
}

@keyframes ti-full-screen-loader-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
