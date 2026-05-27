<script setup lang="ts">
defineProps<{
  label: string;
  inputId: string;
  hint?: string;
}>();
</script>

<template>
  <div class="auth__field">
    <div v-if="$slots['label-row']" class="auth__field-row">
      <label class="auth__label" :for="inputId">{{ label }}</label>
      <slot name="label-row" />
    </div>
    <label v-else class="auth__label" :for="inputId">{{ label }}</label>
    <slot />
    <p v-if="hint" class="auth__hint">{{ hint }}</p>
  </div>
</template>
