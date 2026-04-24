<script setup lang="ts">
withDefaults(defineProps<{
  text: string;
  icon?: string;
  minHeight?: string;
}>(), {
  icon: 'progress_activity',
  minHeight: '14rem',
});
</script>

<template>
  <div
    class="page-state-loader"
    role="status"
    aria-live="polite"
    :style="{ minHeight }"
  >
    <span class="material-symbols-outlined page-state-loader__spinner" aria-hidden="true">
      {{ icon }}
    </span>
    <p class="page-state-loader__text">{{ text }}</p>
  </div>
</template>

<style scoped>
.page-state-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem 1rem;
  border-radius: 0.75rem;
  background: var(--color-surface-container-low);
}

.page-state-loader__spinner {
  font-size: 2rem;
  color: var(--color-secondary-container);
  animation: page-state-loader-spin 0.85s linear infinite;
}

@keyframes page-state-loader-spin {
  to {
    transform: rotate(360deg);
  }
}

.page-state-loader__text {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-on-surface-variant);
}
</style>
