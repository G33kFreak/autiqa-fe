<script setup lang="ts">
useHead({
  titleTemplate: (title) => title ? `${title} · Autiqa` : 'Autiqa',
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
