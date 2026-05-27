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
  <div class="settings-page app-page">
    <AppPageHeader
      :title="t('appSections.settings.title')"
      :lead="t('appSections.settings.lead')"
    />

    <div class="app-settings-grid">
      <article class="app-settings-card">
        <h2 class="app-settings-card__title">
          {{ authStore.user?.name?.trim() || t('layout.userFallback') }}
        </h2>
        <p class="app-settings-card__copy">
          {{ authStore.user?.email }}
        </p>
        <button type="button" class="app-btn app-btn--primary" @click="onSignOut">
          {{ t('appSections.settings.signOut') }}
        </button>
      </article>
    </div>
  </div>
</template>
