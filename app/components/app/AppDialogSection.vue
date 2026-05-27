<script setup lang="ts">
defineProps<{
  icon: string;
  title: string;
  muted?: boolean;
}>();
</script>

<template>
  <section
    class="app-dialog-section"
    :class="{ 'app-dialog-section--muted': muted }"
  >
    <header class="app-dialog-section__head">
      <span class="app-dialog-section__icon-wrap" aria-hidden="true">
        <span class="material-symbols-outlined">{{ icon }}</span>
      </span>
      <h3 class="app-dialog-section__title">{{ title }}</h3>
    </header>
    <div class="app-dialog-section__body">
      <slot />
    </div>
  </section>
</template>
