<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  icon: string;
  count: number;
  tone: 'danger' | 'warning' | 'success' | 'neutral';
}>();
</script>

<template>
  <article class="alerts-module-card" :class="`alerts-module-card--tone-${tone}`">
    <div class="alerts-module-card__head">
      <div>
        <h3 class="alerts-module-card__title">
          <span class="material-symbols-outlined alerts-module-card__title-icon" aria-hidden="true">
            {{ icon }}
          </span>
          {{ title }}
        </h3>
        <p class="alerts-module-card__subtitle">{{ subtitle }}</p>
      </div>
      <span class="alerts-module-card__count" :class="`alerts-module-card__count--${tone}`">
        {{ count }}
      </span>
    </div>
    <slot />
  </article>
</template>

<style scoped>
.alerts-module-card {
  padding: 1.2rem;
  border-radius: 1rem;
  background: var(--color-surface-container-low);
  min-height: 22rem;
  display: grid;
  gap: 0.85rem;
  align-content: start;
  border: 1px solid transparent;
  transition: background-color 0.2s ease;
}

.alerts-module-card--tone-danger {
  border-color: color-mix(in srgb, var(--color-error) 45%, transparent);
  background: color-mix(in srgb, var(--color-error-container) 10%, var(--color-surface-container-low));
}

.alerts-module-card--tone-warning {
  border-color: color-mix(in srgb, #ffb020 45%, transparent);
  background: color-mix(in srgb, #ffb020 8%, var(--color-surface-container-low));
}

.alerts-module-card--tone-success {
  border-color: color-mix(in srgb, var(--color-tertiary, #2ba673) 40%, transparent);
  background: color-mix(in srgb, var(--color-tertiary, #2ba673) 8%, var(--color-surface-container-low));
}

.alerts-module-card--tone-neutral {
  border-color: color-mix(in srgb, var(--color-outline-variant) 35%, transparent);
  background: var(--color-surface-container-low);
}

.alerts-module-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.alerts-module-card__title {
  margin: 0;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-weight: 700;
}

.alerts-module-card__title-icon {
  width: 1.7rem;
  height: 1.7rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  color: var(--color-secondary);
  background: color-mix(in srgb, var(--color-secondary) 12%, white 72%);
}

.alerts-module-card__subtitle {
  margin: 0.3rem 0 0;
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
  font-weight: 700;
}

.alerts-module-card__count {
  min-width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 800;
  background: var(--color-surface-container-high);
  color: var(--color-on-surface-variant);
}

.alerts-module-card__count--danger {
  background: color-mix(in srgb, var(--color-error-container) 85%, var(--color-surface-container-high));
  color: var(--color-on-error-container);
}

.alerts-module-card__count--warning {
  background: color-mix(in srgb, #ffb020 24%, var(--color-surface-container-high));
  color: color-mix(in srgb, #8a5b00 76%, black 10%);
}

.alerts-module-card__count--success {
  background: color-mix(in srgb, var(--color-tertiary, #2ba673) 16%, var(--color-surface-container-high));
  color: color-mix(in srgb, var(--color-tertiary, #2ba673) 88%, black 6%);
}

.alerts-module-card__count--neutral {
  background: var(--color-surface-container-high);
  color: var(--color-on-surface-variant);
}
</style>
