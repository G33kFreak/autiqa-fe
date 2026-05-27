<script setup lang="ts">
defineProps<{
  disabled?: boolean;
}>();
</script>

<template>
  <button
    type="button"
    class="auth__ghost-btn"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
