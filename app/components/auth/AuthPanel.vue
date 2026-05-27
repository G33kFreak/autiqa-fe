<template>
  <section class="auth-split__panel" :aria-labelledby="titleId">
    <div class="auth-split__panel-inner">
      <div class="auth-split__sheet">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  titleId: string;
}>();
</script>
