<script setup lang="ts">
const i18nHead = useLocaleHead({ seo: true });
useHead(i18nHead);
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
