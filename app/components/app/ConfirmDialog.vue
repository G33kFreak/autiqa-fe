<script setup lang="ts">
import type { IconName } from '~/components/app/Icon.vue';
import BaseDialog from '~/components/app/BaseDialog.vue';

/**
 * Confirmation prompt on top of BaseDialog. Defaults to a destructive tone;
 * pass `tone="primary"` for non-destructive confirmations. Optional `details`
 * slot renders a definition list of what's about to change.
 */
withDefaults(
  defineProps<{
    title: string;
    message?: string;
    confirmLabel: string;
    cancelLabel: string;
    tone?: 'danger' | 'primary';
    icon?: IconName;
    busy?: boolean;
    error?: string | null;
  }>(),
  { tone: 'danger', icon: 'alert', busy: false, error: null, message: undefined },
);

const emit = defineEmits<{ confirm: []; cancel: [] }>();
const dialog = ref<InstanceType<typeof BaseDialog> | null>(null);

function open() {
  dialog.value?.open();
}

function close() {
  dialog.value?.close();
}

function onCancel() {
  emit('cancel');
  close();
}

defineExpose({ open, close });
</script>

<template>
  <BaseDialog
    ref="dialog"
    :title="title"
    :subtitle="message"
    :icon="icon"
    :icon-tone="tone === 'danger' ? 'risk' : 'primary'"
    width="min(92vw, 28rem)"
    @close="emit('cancel')"
  >
    <div v-if="$slots.details" class="cd__details">
      <slot name="details" />
    </div>

    <Transition name="cd-fade">
      <p v-if="error" class="ui-banner ui-banner--error cd__error" role="alert">
        <AppIcon name="alert" :size="16" />
        <span>{{ error }}</span>
      </p>
    </Transition>

    <template #footer>
      <div class="cd__actions">
        <button
          type="button"
          class="ui-btn ui-btn--ghost"
          :disabled="busy"
          @click="onCancel"
        >
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          class="ui-btn"
          :class="tone === 'danger' ? 'ui-btn--danger' : 'ui-btn--primary'"
          :disabled="busy"
          @click="emit('confirm')"
        >
          <span v-if="busy" class="ui-spinner" aria-hidden="true" />
          <span>{{ confirmLabel }}</span>
        </button>
      </div>
    </template>
  </BaseDialog>
</template>

<style scoped>
.cd__details {
  margin-bottom: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.cd__error {
  margin-top: var(--space-2);
}

.cd__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.cd-fade-enter-active,
.cd-fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.cd-fade-enter-from,
.cd-fade-leave-to {
  opacity: 0;
}

@media (max-width: 420px) {
  .cd__actions {
    flex-direction: column-reverse;
  }

  .cd__actions .ui-btn {
    width: 100%;
  }
}
</style>
