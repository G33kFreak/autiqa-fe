<script setup lang="ts">
withDefaults(
  defineProps<{
    error?: string | null;
    cancelLabel: string;
    submitLabel: string;
    cancelDisabled?: boolean;
    submitDisabled?: boolean;
    formId?: string;
    submitType?: 'button' | 'submit';
  }>(),
  {
    error: null,
    cancelDisabled: false,
    submitDisabled: false,
    submitType: 'submit',
  },
);

const emit = defineEmits<{
  cancel: [];
  submit: [];
}>();
</script>

<template>
  <div class="app-dialog-footer">
    <p v-if="error" class="app-dialog-footer__error" role="alert">
      {{ error }}
    </p>
    <button
      type="button"
      class="app-btn app-btn--secondary"
      :disabled="cancelDisabled"
      @click="emit('cancel')"
    >
      {{ cancelLabel }}
    </button>
    <button
      :type="submitType"
      class="app-btn app-btn--primary"
      :form="formId"
      :disabled="submitDisabled"
      @click="submitType === 'button' ? emit('submit') : undefined"
    >
      {{ submitLabel }}
    </button>
  </div>
</template>
