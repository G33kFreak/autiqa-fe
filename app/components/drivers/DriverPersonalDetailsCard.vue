<script setup lang="ts">
import type { DriverDto } from '#shared/dto/driver.dto';

type DriverPersonalForm = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

const props = defineProps<{
  driver: DriverDto;
  isEditing?: boolean;
  form: DriverPersonalForm;
}>();

const emit = defineEmits<{
  updateForm: [value: DriverPersonalForm];
}>();

function updateField(
  field: keyof DriverPersonalForm,
  event: Event,
) {
  const el = event.target as HTMLInputElement;
  emit('updateForm', {
    ...props.form,
    [field]: el.value,
  });
}
</script>

<template>
  <article class="driver-card driver-card--accent">
    <h2 class="driver-card__title">
      <span class="material-symbols-outlined" aria-hidden="true">person</span>
      Personal details
    </h2>
    <dl class="driver-card__details-grid">
      <div>
        <dt>First name</dt>
        <dd v-if="!props.isEditing">{{ driver.firstName || '—' }}</dd>
        <dd v-else>
          <input
            class="driver-card__input"
            type="text"
            :value="props.form.firstName"
            @input="updateField('firstName', $event)"
          >
        </dd>
      </div>
      <div>
        <dt>Last name</dt>
        <dd v-if="!props.isEditing">{{ driver.lastName || '—' }}</dd>
        <dd v-else>
          <input
            class="driver-card__input"
            type="text"
            :value="props.form.lastName"
            @input="updateField('lastName', $event)"
          >
        </dd>
      </div>
      <div>
        <dt>Email address</dt>
        <dd v-if="!props.isEditing">{{ driver.email || '—' }}</dd>
        <dd v-else>
          <input
            class="driver-card__input"
            type="email"
            :value="props.form.email"
            @input="updateField('email', $event)"
          >
        </dd>
      </div>
      <div>
        <dt>Phone number</dt>
        <dd v-if="!props.isEditing">{{ driver.phoneNumber || '—' }}</dd>
        <dd v-else>
          <input
            class="driver-card__input"
            type="tel"
            :value="props.form.phoneNumber"
            @input="updateField('phoneNumber', $event)"
          >
        </dd>
      </div>
    </dl>
  </article>
</template>

<style scoped>
.driver-card {
  border-radius: 1rem;
  padding: 1.4rem;
  background: var(--color-surface-container-low);
}

.driver-card--accent {
  position: relative;
  overflow: hidden;
}

.driver-card--accent::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0.25rem;
  background: linear-gradient(
    180deg,
    var(--color-secondary) 0%,
    var(--color-tertiary-fixed) 100%
  );
}

.driver-card__title {
  margin: 0 0 1.1rem;
  color: var(--color-on-surface);
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.driver-card__title :deep(.material-symbols-outlined) {
  color: var(--color-outline);
  font-size: 1.15rem;
}

.driver-card__details-grid {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 1.2rem;
}

.driver-card__details-grid dt {
  margin: 0 0 0.25rem;
  color: var(--color-outline);
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.driver-card__details-grid dd {
  margin: 0;
  color: var(--color-on-surface);
  font-size: 0.875rem;
  font-weight: 600;
}

.driver-card__input {
  width: 100%;
  border: none;
  border-radius: 0.5rem;
  padding: 0.55rem 0.65rem;
  background: var(--color-surface-container-highest);
  color: var(--color-on-surface);
  font-size: 0.875rem;
  font-weight: 600;
}

.driver-card__input:focus {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 30%, transparent);
}

@media (max-width: 900px) {
  .driver-card__details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
