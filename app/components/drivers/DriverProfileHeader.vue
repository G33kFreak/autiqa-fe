<script setup lang="ts">
defineProps<{
  fullName: string;
  assignmentActionLabel: string;
  editLabel: string;
  saveLabel: string;
  savingLabel: string;
  cancelLabel: string;
  isEditing?: boolean;
  isSaving?: boolean;
}>();

const { t } = useI18n();

const emit = defineEmits<{
  startEdit: [];
  saveEdit: [];
  cancelEdit: [];
  assignCar: [];
}>();
</script>

<template>
  <header class="driver-profile-header app-surface app-surface--raised">
    <div class="driver-profile-header__identity">
      <p class="driver-profile-header__kicker">{{ t('nav.drivers') }}</p>
      <h1 class="driver-profile-header__title">{{ fullName }}</h1>
    </div>
    <div class="driver-profile-header__actions">
      <template v-if="!isEditing">
        <button
          type="button"
          class="app-btn app-btn--secondary"
          @click="emit('startEdit')"
        >
          <span class="material-symbols-outlined app-btn__icon" aria-hidden="true">edit</span>
          {{ editLabel }}
        </button>
        <button
          type="button"
          class="app-btn app-btn--primary"
          @click="emit('assignCar')"
        >
          <span class="material-symbols-outlined app-btn__icon" aria-hidden="true">swap_horiz</span>
          {{ assignmentActionLabel }}
        </button>
      </template>
      <template v-else>
        <button
          type="button"
          class="app-btn app-btn--primary"
          :disabled="isSaving"
          @click="emit('saveEdit')"
        >
          {{ isSaving ? savingLabel : saveLabel }}
        </button>
        <button
          type="button"
          class="app-btn app-btn--secondary"
          :disabled="isSaving"
          @click="emit('cancelEdit')"
        >
          {{ cancelLabel }}
        </button>
      </template>
    </div>
  </header>
</template>

<style scoped>
.driver-profile-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 1.35rem 1.4rem;
}

.driver-profile-header__kicker {
  margin: 0 0 0.35rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.driver-profile-header__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 2.4vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-on-surface);
  line-height: 1.1;
}

.driver-profile-header__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
