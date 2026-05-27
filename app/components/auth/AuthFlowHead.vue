<script setup lang="ts">
defineProps<{
  titleId: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <header class="auth-flow-head">
    <p v-if="eyebrow" class="auth-flow-head__eyebrow">{{ eyebrow }}</p>
    <h1 :id="titleId" class="auth-flow-head__title">{{ title }}</h1>
    <p v-if="subtitle" class="auth-flow-head__subtitle">{{ subtitle }}</p>
  </header>
</template>
