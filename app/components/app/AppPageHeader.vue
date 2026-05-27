<script setup lang="ts">
defineProps<{
  kicker?: string;
  title: string;
  lead?: string;
}>();
</script>

<template>
  <header class="app-page-header">
    <div class="app-page-header__main">
      <p v-if="kicker" class="app-page-header__kicker">{{ kicker }}</p>
      <h1 class="app-page-header__title">{{ title }}</h1>
      <p v-if="lead" class="app-page-header__lead">{{ lead }}</p>
    </div>
    <div v-if="$slots.actions" class="app-page-header__actions">
      <slot name="actions" />
    </div>
    <slot />
  </header>
</template>
