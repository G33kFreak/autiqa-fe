<script setup lang="ts">
/** App shell: single path `/app` for every locale (no `/en/app`). */
definePageMeta({
  i18n: false,
})

const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: computed(() => t('meta.app.title')),
  description: computed(() => t('meta.app.description')),
})
</script>

<template>
  <main class="app-shell">
    <h1 class="app-shell__title">{{ t('appShell.title') }}</h1>
    <p class="app-shell__lead">{{ t('appShell.lead') }}</p>
    <NuxtLink :to="localePath('/')" class="app-shell__link">
      {{ t('appShell.backHome') }}
    </NuxtLink>
  </main>
</template>

<style scoped>
.app-shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  text-align: center;
  background: var(--color-surface);
  color: var(--color-on-surface);
}

.app-shell__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.app-shell__lead {
  margin: 0;
  max-width: 28rem;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
}

.app-shell__link {
  margin-top: 0.5rem;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-secondary);
  text-decoration: none;
}

.app-shell__link:hover {
  color: var(--color-secondary-container);
}
</style>
