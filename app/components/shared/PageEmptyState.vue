<script setup lang="ts">
const props = withDefaults(defineProps<{
  icon: string;
  badgeIcon?: string;
  title: string;
  subtitle: string;
  primaryCtaLabel?: string;
  primaryCtaIcon?: string;
  primaryAriaLabel?: string;
  secondaryCtaLabel?: string;
  secondaryCtaIcon?: string;
  secondaryAriaLabel?: string;
  secondaryDisabled?: boolean;
  secondaryTitle?: string;
}>(), {
  badgeIcon: 'add',
  primaryCtaIcon: 'add_circle',
  secondaryCtaIcon: 'add_circle',
  secondaryDisabled: false,
  secondaryTitle: '',
});

const emit = defineEmits<{
  primary: [];
  secondary: [];
}>();
</script>

<template>
  <div class="page-empty-state">
    <div class="page-empty-state__hero">
      <div class="page-empty-state__visual">
        <div class="page-empty-state__glow" aria-hidden="true" />
        <div class="page-empty-state__icon-ring">
          <span class="material-symbols-outlined page-empty-state__icon" aria-hidden="true">
            {{ props.icon }}
          </span>
          <div class="page-empty-state__badge" aria-hidden="true">
            <span class="material-symbols-outlined page-empty-state__badge-icon">
              {{ props.badgeIcon }}
            </span>
          </div>
        </div>
      </div>

      <h1 class="page-empty-state__title">{{ props.title }}</h1>
      <p class="page-empty-state__subtitle">{{ props.subtitle }}</p>

      <div
        v-if="primaryCtaLabel || secondaryCtaLabel || $slots.actions"
        class="page-empty-state__actions"
      >
        <slot name="actions">
          <button
            v-if="primaryCtaLabel"
            type="button"
            class="page-empty-state__cta page-empty-state__cta--primary"
            :aria-label="primaryAriaLabel || primaryCtaLabel"
            @click="emit('primary')"
          >
            <span class="material-symbols-outlined page-empty-state__cta-icon" aria-hidden="true">
              {{ props.primaryCtaIcon }}
            </span>
            {{ props.primaryCtaLabel }}
          </button>
          <button
            v-if="secondaryCtaLabel"
            type="button"
            class="page-empty-state__cta page-empty-state__cta--secondary"
            :disabled="secondaryDisabled"
            :title="secondaryTitle"
            :aria-label="secondaryAriaLabel || secondaryCtaLabel"
            @click="emit('secondary')"
          >
            <span class="material-symbols-outlined page-empty-state__cta-icon" aria-hidden="true">
              {{ props.secondaryCtaIcon }}
            </span>
            {{ props.secondaryCtaLabel }}
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: min(36rem, calc(100dvh - 12rem));
  padding: 2rem 1rem 3rem;
}

.page-empty-state__hero {
  width: 100%;
  max-width: 36rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.page-empty-state__visual {
  position: relative;
  margin-bottom: 2rem;
}

.page-empty-state__glow {
  position: absolute;
  inset: -35%;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-secondary-container) 14%, transparent);
  filter: blur(36px);
  transform: scale(1.15);
  transition: transform 0.45s ease, background 0.45s ease;
  pointer-events: none;
}

.page-empty-state__visual:hover .page-empty-state__glow {
  transform: scale(1.25);
  background: color-mix(in srgb, var(--color-secondary-container) 18%, transparent);
}

.page-empty-state__icon-ring {
  position: relative;
  z-index: 1;
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-container-lowest);
  box-shadow:
    var(--shadow-ambient),
    0 0 0 1px color-mix(in srgb, var(--color-outline-variant) 15%, transparent);
}

.page-empty-state__icon {
  font-size: 3.75rem;
  line-height: 1;
  color: color-mix(in srgb, var(--color-secondary) 88%, var(--color-secondary-container));
  opacity: 0.88;
  font-variation-settings:
    'FILL' 0,
    'wght' 200,
    'GRAD' 0,
    'opsz' 24;
}

.page-empty-state__badge {
  position: absolute;
  right: -0.125rem;
  bottom: -0.125rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    145deg,
    var(--color-secondary) 0%,
    var(--color-secondary-container) 100%
  );
  color: var(--color-on-secondary);
  box-shadow:
    0 6px 18px color-mix(in srgb, var(--color-secondary) 28%, transparent),
    0 0 0 4px var(--color-surface-container-lowest);
}

.page-empty-state__badge-icon {
  font-size: 1.25rem;
  font-variation-settings:
    'FILL' 1,
    'wght' 500,
    'GRAD' 0,
    'opsz' 24;
}

.page-empty-state__title {
  margin: 0 0 1rem;
  max-width: 26rem;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 1.875rem);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.15;
  color: var(--color-on-surface);
}

.page-empty-state__subtitle {
  margin: 0 0 2.25rem;
  max-width: 28rem;
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.6;
  color: var(--color-on-surface-variant);
}

.page-empty-state__actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
  width: 100%;
  max-width: 22rem;
}

@media (min-width: 480px) {
  .page-empty-state__actions {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    max-width: none;
  }

  .page-empty-state__cta {
    min-width: 12rem;
  }
}

.page-empty-state__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    opacity 0.18s ease,
    transform 0.18s ease,
    background 0.18s ease;
}

.page-empty-state__cta--primary {
  color: var(--color-on-secondary);
  background: linear-gradient(
    135deg,
    var(--color-secondary) 0%,
    var(--color-secondary-container) 100%
  );
  box-shadow:
    0 4px 16px color-mix(in srgb, var(--color-secondary-container) 28%, transparent),
    0 12px 32px color-mix(in srgb, var(--color-secondary) 12%, transparent);
}

.page-empty-state__cta--primary:hover:not(:disabled) {
  opacity: 0.96;
  transform: translateY(-1px);
  box-shadow:
    0 6px 22px color-mix(in srgb, var(--color-secondary-container) 32%, transparent),
    0 14px 36px color-mix(in srgb, var(--color-secondary) 14%, transparent);
}

.page-empty-state__cta--secondary {
  color: var(--color-on-surface);
  background: var(--color-surface-container-high);
}

.page-empty-state__cta--secondary:hover:not(:disabled) {
  background: var(--color-surface-container-highest);
}

.page-empty-state__cta--secondary:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.page-empty-state__cta:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  outline-offset: 3px;
}

.page-empty-state__cta-icon {
  font-size: 1.25rem;
}
</style>
