<script setup lang="ts">
const { t } = useI18n();
const authStore = useAuthStore();

async function onSignOut() {
  await authStore.logout();
}

useSeoMeta({
  title: computed(() => t('appSections.settings.title')),
  description: computed(() => t('appSections.settings.lead')),
});
</script>

<template>
  <div class="settings-page">
    <h1 class="app-page__title">{{ t('appSections.settings.title') }}</h1>
    <p class="app-page__lead">{{ t('appSections.settings.lead') }}</p>
    <button type="button" class="settings-page__sign-out" @click="onSignOut">
      {{ t('appSections.settings.signOut') }}
    </button>
  </div>
</template>

<style scoped>
.settings-page__sign-out {
  margin-top: 0.25rem;
  border: none;
  border-radius: 0.75rem;
  padding: 0.55rem 1.1rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  color: var(--color-on-secondary);
  background: linear-gradient(
    135deg,
    var(--color-secondary) 0%,
    color-mix(in srgb, var(--color-secondary-container) 55%, var(--color-secondary)) 100%
  );
  transition: filter 0.18s ease;
}

.settings-page__sign-out:hover {
  filter: brightness(1.06);
}

.settings-page__sign-out:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 45%, transparent);
  outline-offset: 2px;
}
</style>
