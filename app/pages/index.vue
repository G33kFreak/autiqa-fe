<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: computed(() => t('meta.home.title')),
  description: computed(() => t('meta.home.description')),
})
</script>

<template>
  <main class="landing">
    <h1 class="title">{{ t('brand') }}</h1>
    <NuxtLink :to="localePath('/login')" class="cta">{{ t('landing.cta') }}</NuxtLink>
  </main>
</template>

<style scoped>
.landing {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 1.5rem;
}

.title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 1.25rem;
  border-radius: 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  text-decoration: none;
  background: linear-gradient(
    135deg,
    var(--color-secondary),
    var(--color-secondary-deep)
  );
}

.cta:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  outline-offset: 3px;
}
</style>
