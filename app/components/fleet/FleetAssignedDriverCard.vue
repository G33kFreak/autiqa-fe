<script setup lang="ts">
import InitialsAvatar from '~/components/shared/InitialsAvatar.vue';

const props = withDefaults(
  defineProps<{
    name: string;
    phone: string;
    email?: string;
  }>(),
  { email: '' },
);

const emit = defineEmits<{
  assignOther: [];
  removeDriver: [];
}>();

const { t } = useI18n();
const hasDriver = computed(() => Boolean((props.name || '').trim()));

const avatarAriaLabel = computed(() =>
  hasDriver.value
    ? props.name.trim()
    : t('appSections.fleet.driverUnassigned'),
);

type ContactSegment = { kind: 'email' | 'phone'; value: string };

/** Non-empty email / phone in stable order (email, then phone). */
const contactSegments = computed<ContactSegment[]>(() => {
  if (!hasDriver.value) return [];
  const out: ContactSegment[] = [];
  const email = (props.email ?? '').trim();
  const phone = (props.phone ?? '').trim();
  if (email) out.push({ kind: 'email', value: email });
  if (phone) out.push({ kind: 'phone', value: phone });
  return out;
});

function contactIcon(kind: ContactSegment['kind']): string {
  return kind === 'email' ? 'mail' : 'call';
}
</script>

<template>
  <article class="compliance-row__small">
    <p class="compliance-row__label">{{ t('appSections.fleet.vehicleDetails.assignedDriver') }}</p>
    <div class="compliance-row__identity">
      <InitialsAvatar
        :label="hasDriver ? name : ''"
        size="md"
        :aria-label="avatarAriaLabel"
      />
      <div class="compliance-row__text">
        <p class="compliance-row__title">
          {{ hasDriver ? name : t('appSections.fleet.driverUnassigned') }}
        </p>
        <p v-if="hasDriver && contactSegments.length" class="compliance-row__subtitle">
          <template v-for="(seg, i) in contactSegments" :key="`${seg.kind}-${i}`">
            <span v-if="i > 0" class="compliance-row__subtitle-sep" aria-hidden="true">·</span>
            <span class="compliance-row__subtitle-item">
              <span
                class="material-symbols-outlined compliance-row__subtitle-icon"
                aria-hidden="true"
              >{{ contactIcon(seg.kind) }}</span>
              {{ seg.value }}
            </span>
          </template>
        </p>
        <p v-else-if="!hasDriver" class="compliance-row__description">
          {{ t('appSections.fleet.vehicleDetails.emptyDriverCopy') }}
        </p>
      </div>
    </div>
    <div class="driver-actions">
      <button type="button" class="button button--primary" @click="emit('assignOther')">
        {{ t('appSections.fleet.vehicleDetails.assignOther') }}
      </button>
      <button
        v-if="hasDriver"
        type="button"
        class="button button--secondary"
        @click="emit('removeDriver')"
      >
        {{ t('appSections.fleet.vehicleDetails.removeDriver') }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.compliance-row__small {
  border-radius: 0.875rem;
  background: var(--color-surface-container-lowest);
  padding: 0.9rem;
}

.compliance-row__label {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.compliance-row__identity {
  margin-top: 0.55rem;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0.75rem;
  width: 100%;
}

.compliance-row__text {
  min-width: 0;
  flex: 0 1 auto;
}

.compliance-row__title {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.2;
  font-weight: 800;
  color: var(--color-on-surface);
}

.compliance-row__subtitle {
  margin: 0.25rem 0 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.45rem;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  line-height: 1.35;
  font-weight: 500;
  color: var(--color-on-surface-variant);
  word-break: break-word;
}

.compliance-row__subtitle-item {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  min-width: 0;
}

.compliance-row__subtitle-icon {
  flex-shrink: 0;
  font-size: 1rem;
  line-height: 1;
  color: var(--color-outline);
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'GRAD' 0,
    'opsz' 20;
}

.compliance-row__subtitle-sep {
  color: color-mix(in srgb, var(--color-on-surface-variant) 55%, transparent);
  user-select: none;
  font-weight: 600;
}

.compliance-row__description {
  margin: 0.35rem 0 0;
  font-size: 0.875rem;
  line-height: 1.25;
  color: var(--color-on-surface-variant);
}

.driver-actions {
  margin-top: 0.95rem;
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2rem;
  border: none;
  border-radius: 0.75rem;
  padding: 0.6rem 0.95rem;
  font-size: 0.8125rem;
  line-height: 1.2;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    filter 0.2s ease;
}

.button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  outline-offset: 2px;
}

.button--primary {
  background: var(--color-secondary);
  color: var(--color-on-secondary);
}

.button--primary:hover {
  filter: brightness(1.06);
}

.button--secondary {
  background: var(--color-surface-container-high);
  color: var(--color-on-surface);
}

.button--secondary:hover {
  background: var(--color-surface-container);
}

@media (max-width: 30rem) {
  .driver-actions {
    flex-direction: column;
  }

  .button {
    width: 100%;
    justify-content: center;
  }
}
</style>
