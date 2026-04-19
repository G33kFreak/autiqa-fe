<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
  title: computed(() => t('appSections.finance.title')),
  description: computed(() => t('appSections.finance.lead')),
});
</script>

<template>
  <div>
    <h1 class="app-page__title">{{ t('appSections.finance.title') }}</h1>
    <p class="app-page__lead">{{ t('appSections.finance.lead') }}</p>
  </div>
</template>
