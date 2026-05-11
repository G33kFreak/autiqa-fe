<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
  title: computed(() => t('meta.home.title')),
  description: computed(() => t('meta.home.description')),
});
</script>

<template>
  <LandingHome />
</template>
