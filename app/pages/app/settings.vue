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
    <h1 class="app-page__title">{{ t('appSections.settings.title') }}</h1>
    <p class="app-page__lead">{{ t('appSections.settings.lead') }}</p>
    <button type="button" class="app-btn app-btn--primary settings-page__sign-out" @click="onSignOut">
      {{ t('appSections.settings.signOut') }}
    </button>
  </div>
</template>

<style scoped>
.settings-page__sign-out {
  margin-top: 0.5rem;
  width: fit-content;
}
</style>
