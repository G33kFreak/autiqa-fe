<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
  title: computed(() => t('appSections.map.title')),
  description: computed(() => t('appSections.map.lead')),
});
</script>

<template>
  <div class="app-page">
    <AppPageHeader
      :title="t('appSections.map.title')"
      :lead="t('appSections.map.lead')"
    />
    <AppComingSoon
      icon="map"
      :badge="t('appSections.dashboard.alerts.hero.kicker')"
      :title="t('appSections.map.title')"
      :lead="t('appSections.map.lead')"
    />
  </div>
</template>
