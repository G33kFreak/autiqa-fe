<script setup lang="ts">
defineProps<{
  icon: string;
  title: string;
  description: string;
}>();
</script>

<template>
  <div class="list-empty-state" role="status">
    <div class="list-empty-state__icon-wrap" aria-hidden="true">
      <span class="material-symbols-outlined list-empty-state__icon">{{ icon }}</span>
    </div>
    <p class="list-empty-state__title">{{ title }}</p>
    <p class="list-empty-state__copy">{{ description }}</p>
  </div>
</template>

<style scoped>
.list-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 11.5rem;
  padding: 2rem 1.5rem 2.25rem;
  border-radius: 0.875rem;
  background: var(--color-surface-container-lowest);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--color-on-surface) 2.5%, transparent);
}

.list-empty-state__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  margin-bottom: 1rem;
  border-radius: 50%;
  background: var(--color-secondary-fixed);
  color: var(--color-secondary-container);
}

.list-empty-state__icon {
  font-size: 1.65rem;
  line-height: 1;
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'GRAD' 0,
    'opsz' 24;
}

.list-empty-state__title {
  margin: 0;
  max-width: 22rem;
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.3;
  color: var(--color-on-surface);
}

.list-empty-state__copy {
  margin: 0.65rem 0 0;
  max-width: 22rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  color: var(--color-on-surface-variant);
}
</style>
