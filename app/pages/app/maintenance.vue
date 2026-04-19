<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
  title: computed(() => t('appSections.maintenance.title')),
  description: computed(() => t('appSections.maintenance.lead')),
});
</script>

<template>
  <div>
    <h1 class="app-page__title">{{ t('appSections.maintenance.title') }}</h1>
    <p class="app-page__lead">{{ t('appSections.maintenance.lead') }}</p>
  </div>
</template>
