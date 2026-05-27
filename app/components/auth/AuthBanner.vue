<script setup lang="ts">
const props = defineProps<{
  variant: 'error' | 'success';
  message: string;
}>();

const role = computed(() => (props.variant === 'error' ? 'alert' : 'status'));
</script>

<template>
  <p
    class="auth__banner"
    :class="`auth__banner--${variant}`"
    :role="role"
  >
    {{ message }}
  </p>
</template>
