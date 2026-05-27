<script setup lang="ts">
defineProps<{
  label: string;
  inputId: string;
  hint?: string;
}>();
</script>

<template>
  <div class="auth-field">
    <div v-if="$slots['label-row']" class="auth-field-row">
      <label class="auth-label" :for="inputId">{{ label }}</label>
      <slot name="label-row" />
    </div>
    <label v-else class="auth-label" :for="inputId">{{ label }}</label>
    <slot />
    <p v-if="hint" class="auth-hint">{{ hint }}</p>
  </div>
</template>
