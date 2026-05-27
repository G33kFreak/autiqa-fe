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
    class="app-btn app-btn--primary auth-submit"
    :disabled="pending"
    :aria-busy="pending"
  >
    <span v-if="pending" class="auth-submit__spinner" aria-hidden="true">
      <svg class="auth-submit__spinner-svg" viewBox="0 0 24 24">
        <circle
          class="auth-submit__spinner-track"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        />
        <circle
          class="auth-submit__spinner-arc"
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
