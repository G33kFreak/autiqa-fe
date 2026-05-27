<script setup lang="ts">
defineProps<{
  pending: boolean;
  label: string;
  pendingLabel: string;
}>();
</script>

<template>
  <button
    type="submit"
    class="auth__submit"
    :disabled="pending"
    :aria-busy="pending"
  >
    <span v-if="pending" class="auth__submit-spinner" aria-hidden="true">
      <svg class="auth__submit-spinner-svg" viewBox="0 0 24 24">
        <circle
          class="auth__submit-spinner-track"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        />
        <circle
          class="auth__submit-spinner-arc"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
        />
      </svg>
    </span>
    <span>{{ pending ? pendingLabel : label }}</span>
  </button>
</template>
