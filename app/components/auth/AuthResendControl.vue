<script setup lang="ts">
defineProps<{
  pending: boolean;
  cooldown: number;
  disabled?: boolean;
  pendingLabel: string;
  label: string;
  waitLabel: string;
}>();

const emit = defineEmits<{
  resend: [];
}>();
</script>

<template>
  <div class="auth__resend-row">
    <button
      type="button"
      class="auth__resend"
      :disabled="disabled || cooldown > 0 || pending"
      @click="emit('resend')"
    >
      {{ pending ? pendingLabel : label }}
    </button>
    <span
      v-if="cooldown > 0"
      class="auth__resend-wait"
      aria-live="polite"
    >
      {{ waitLabel }}
    </span>
  </div>
</template>
