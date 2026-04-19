<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
  title: computed(() => t('appSections.map.title')),
  description: computed(() => t('appSections.map.lead')),
});
</script>

<template>
  <div>
    <h1 class="app-page__title">{{ t('appSections.map.title') }}</h1>
    <p class="app-page__lead">{{ t('appSections.map.lead') }}</p>
  </div>
</template>
