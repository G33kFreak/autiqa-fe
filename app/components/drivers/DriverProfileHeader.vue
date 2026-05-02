<script setup lang="ts">
const props = defineProps<{
  fullName: string;
  assignmentActionLabel: string;
  isEditing?: boolean;
  isSaving?: boolean;
}>();

const emit = defineEmits<{
  startEdit: [];
  saveEdit: [];
  cancelEdit: [];
  assignCar: [];
}>();
</script>

<template>
  <header class="driver-profile-header">
    <h1 class="driver-profile-header__title">{{ fullName }}</h1>
    <div class="driver-profile-header__actions">
      <template v-if="!props.isEditing">
        <button
          type="button"
          class="driver-profile-header__action driver-profile-header__action--secondary"
          @click="emit('startEdit')"
        >
          <span class="material-symbols-outlined" aria-hidden="true">edit</span>
          Edit profile
        </button>
        <button
          type="button"
          class="driver-profile-header__action driver-profile-header__action--primary"
          @click="emit('assignCar')"
        >
          <span class="material-symbols-outlined" aria-hidden="true">swap_horiz</span>
          {{ assignmentActionLabel }}
        </button>
      </template>
      <template v-else>
        <button
          type="button"
          class="driver-profile-header__action driver-profile-header__action--primary"
          :disabled="props.isSaving"
          @click="emit('saveEdit')"
        >
          {{ props.isSaving ? 'Saving...' : 'Save changes' }}
        </button>
        <button
          type="button"
          class="driver-profile-header__action driver-profile-header__action--secondary"
          :disabled="props.isSaving"
          @click="emit('cancelEdit')"
        >
          Cancel
        </button>
      </template>
    </div>
  </header>
</template>

<style scoped>
.driver-profile-header {
  border-radius: 1rem;
  padding: 1.4rem;
  background: var(--color-surface-container-low);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.driver-profile-header__title {
  margin: 0;
  color: var(--color-on-surface);
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 2.4vw, 2rem);
  font-weight: 800;
}

.driver-profile-header__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.driver-profile-header__action {
  border: none;
  border-radius: 0.75rem;
  padding: 0.6rem 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    filter 0.18s ease,
    opacity 0.18s ease;
}

.driver-profile-header__action:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.driver-profile-header__action--secondary {
  background: var(--color-surface-container-high);
  color: var(--color-on-surface);
}

.driver-profile-header__action--secondary:hover {
  background: var(--color-surface-container);
}

.driver-profile-header__action--primary {
  color: var(--color-on-secondary);
  background: var(--color-secondary);
}

.driver-profile-header__action--primary:hover:not(:disabled) {
  filter: brightness(1.06);
}

.driver-profile-header__action:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-secondary) 30%, transparent);
}

@media (max-width: 900px) {
  .driver-profile-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
