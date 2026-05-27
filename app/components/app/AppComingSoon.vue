<script setup lang="ts">
defineProps<{
  icon: string;
  title: string;
  lead: string;
  badge?: string;
}>();
</script>

<template>
  <div class="app-coming-soon app-surface app-surface--raised">
    <div class="app-coming-soon__icon-wrap" aria-hidden="true">
      <span class="material-symbols-outlined app-coming-soon__icon">{{ icon }}</span>
    </div>
    <div class="app-coming-soon__copy">
      <p v-if="badge" class="app-coming-soon__badge">{{ badge }}</p>
      <h2 class="app-coming-soon__title">{{ title }}</h2>
      <p class="app-coming-soon__lead">{{ lead }}</p>
    </div>
  </div>
</template>
