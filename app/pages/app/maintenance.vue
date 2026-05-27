<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
  title: computed(() => t('appSections.maintenance.title')),
  description: computed(() => t('appSections.maintenance.lead')),
});
</script>

<template>
  <div class="app-page">
    <AppPageHeader
      :title="t('appSections.maintenance.title')"
      :lead="t('appSections.maintenance.lead')"
    />
    <AppComingSoon
      icon="build_circle"
      :badge="t('appSections.dashboard.alerts.hero.kicker')"
      :title="t('appSections.maintenance.title')"
      :lead="t('appSections.maintenance.lead')"
    />
  </div>
</template>
