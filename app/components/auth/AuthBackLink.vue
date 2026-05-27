<script setup lang="ts">
defineProps<{
  to: string;
  label: string;
}>();
</script>

<template>
  <NuxtLink class="auth-back" :to="to">
    <span class="material-symbols-outlined auth-back__icon" aria-hidden="true">arrow_back</span>
    {{ label }}
  </NuxtLink>
</template>
