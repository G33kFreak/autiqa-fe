<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
  title: computed(() => t('appSections.settings.title')),
  description: computed(() => t('appSections.settings.lead')),
});
</script>

<template>
  <div>
    <h1 class="app-page__title">{{ t('appSections.settings.title') }}</h1>
    <p class="app-page__lead">{{ t('appSections.settings.lead') }}</p>
  </div>
</template>
