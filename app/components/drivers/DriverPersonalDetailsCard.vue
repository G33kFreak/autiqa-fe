<script setup lang="ts">
import type { DriverDto } from '#shared/dto/driver.dto';
const { t } = useI18n();

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
  <article class="driver-card">
    <h2 class="driver-card__title">
      <span class="driver-card__title-icon" aria-hidden="true">
        <span class="material-symbols-outlined">person</span>
      </span>
      {{ t('appSections.drivers.details.personal.title') }}
    </h2>
    <dl class="driver-card__details-grid">
      <div>
        <dt>{{ t('appSections.drivers.details.personal.firstName') }}</dt>
        <dd v-if="!props.isEditing">{{ driver.firstName || t('appSections.drivers.details.common.emptyValue') }}</dd>
        <dd v-else>
          <input
            class="ti-input driver-card__input"
            type="text"
            :value="props.form.firstName"
            @input="updateField('firstName', $event)"
          >
        </dd>
      </div>
      <div>
        <dt>{{ t('appSections.drivers.details.personal.lastName') }}</dt>
        <dd v-if="!props.isEditing">{{ driver.lastName || t('appSections.drivers.details.common.emptyValue') }}</dd>
        <dd v-else>
          <input
            class="ti-input driver-card__input"
            type="text"
            :value="props.form.lastName"
            @input="updateField('lastName', $event)"
          >
        </dd>
      </div>
      <div>
        <dt>{{ t('appSections.drivers.details.personal.email') }}</dt>
        <dd v-if="!props.isEditing">{{ driver.email || t('appSections.drivers.details.common.emptyValue') }}</dd>
        <dd v-else>
          <input
            class="ti-input driver-card__input"
            type="email"
            :value="props.form.email"
            @input="updateField('email', $event)"
          >
        </dd>
      </div>
      <div>
        <dt>{{ t('appSections.drivers.details.personal.phone') }}</dt>
        <dd v-if="!props.isEditing">{{ driver.phoneNumber || t('appSections.drivers.details.common.emptyValue') }}</dd>
        <dd v-else>
          <input
            class="ti-input driver-card__input"
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
  border-radius: var(--app-radius-card, 1rem);
  padding: 1.35rem;
  background: var(--color-surface-container-lowest);
  box-shadow: var(--shadow-ambient);
}

.driver-card__title {
  margin: 0 0 1.15rem;
  color: var(--color-on-surface);
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.driver-card__title-icon {
  flex-shrink: 0;
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 0.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--color-secondary-fixed) 72%, var(--color-surface-container-lowest));
  color: var(--color-secondary);
}

.driver-card__title-icon .material-symbols-outlined {
  font-size: 1.2rem;
  font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}

.driver-card__details-grid {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 1.2rem;
}

.driver-card__details-grid dt {
  margin: 0 0 0.25rem;
  color: var(--color-on-surface-variant);
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.driver-card__details-grid dd {
  margin: 0;
  color: var(--color-on-surface);
  font-size: 0.875rem;
  font-weight: 600;
}

.driver-card__input {
  font-weight: 600;
}

@media (max-width: 900px) {
  .driver-card__details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
