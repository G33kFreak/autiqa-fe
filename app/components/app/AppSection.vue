<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
  id?: string;
}>();
</script>

<template>
  <section class="app-section" :aria-labelledby="id">
    <header v-if="title || $slots.actions" class="app-section__head">
      <div v-if="title || description" class="app-section__text">
        <h2 v-if="title" :id="id" class="app-section__title">{{ title }}</h2>
        <p v-if="description" class="app-section__description">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="app-section__actions">
        <slot name="actions" />
      </div>
    </header>
    <div class="app-section__body">
      <slot />
    </div>
  </section>
</template>
