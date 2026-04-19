<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
  title: computed(() => t('appSections.drivers.title')),
  description: computed(() => t('appSections.drivers.lead')),
});
</script>

<template>
  <div>
    <h1 class="app-page__title">{{ t('appSections.drivers.title') }}</h1>
    <p class="app-page__lead">{{ t('appSections.drivers.lead') }}</p>
  </div>
</template>
