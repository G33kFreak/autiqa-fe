<script setup lang="ts">
const authStore = useAuthStore();
</script>

<template>
  <section class="app-placeholder">
    <h1 class="app-placeholder__title">{{ $t('app.placeholderTitle') }}</h1>
    <p class="app-placeholder__lede">
      {{ $t('app.placeholderLede', { name: authStore.user?.name ?? '' }) }}
    </p>
  </section>
</template>

<style scoped>
.app-placeholder {
  max-width: 36rem;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.app-placeholder__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.625rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--color-ink);
}

.app-placeholder__lede {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--color-muted);
}
</style>
