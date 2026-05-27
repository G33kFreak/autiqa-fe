<script setup lang="ts">
defineProps<{
  icon: string;
  title: string;
  hasError?: boolean;
  showRemove?: boolean;
  removeLabel?: string;
  removeDisabled?: boolean;
}>();

const emit = defineEmits<{
  remove: [];
}>();
</script>

<template>
  <article
    class="app-dialog-card"
    :class="{ 'app-dialog-card--error': hasError }"
  >
    <header class="app-dialog-card__head">
      <div class="app-dialog-card__title-row">
        <span class="app-dialog-card__icon-wrap" aria-hidden="true">
          <span class="material-symbols-outlined">{{ icon }}</span>
        </span>
        <h3 class="app-dialog-card__title">{{ title }}</h3>
      </div>
      <button
        v-if="showRemove"
        type="button"
        class="app-dialog-card__remove"
        :aria-label="removeLabel"
        :disabled="removeDisabled"
        @click="emit('remove')"
      >
        <span class="material-symbols-outlined" aria-hidden="true">close</span>
      </button>
    </header>
    <div class="app-dialog-card__body">
      <slot />
    </div>
  </article>
</template>
