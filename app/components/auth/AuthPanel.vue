<template>
  <section class="auth__panel" :aria-labelledby="titleId">
    <div class="auth__panel-inner">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  titleId: string;
}>();
</script>
