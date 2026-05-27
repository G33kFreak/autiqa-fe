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
  <article
    class="app-module-card alerts-module-card"
    :class="`app-module-card--${tone} alerts-module-card--tone-${tone}`"
  >
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
.alerts-module-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.alerts-module-card__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.alerts-module-card__title-icon {
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 0.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  color: var(--color-secondary);
  background: color-mix(in srgb, var(--color-secondary-fixed) 70%, var(--color-surface-container-lowest));
}

.alerts-module-card--tone-danger .alerts-module-card__title-icon {
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-error-container) 75%, var(--color-surface-container-lowest));
}

.alerts-module-card--tone-warning .alerts-module-card__title-icon {
  color: var(--color-warning);
  background: var(--color-warning-container);
}

.alerts-module-card--tone-success .alerts-module-card__title-icon {
  color: var(--color-success);
  background: var(--color-success-container);
}

.alerts-module-card__subtitle {
  margin: 0.3rem 0 0;
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
  font-weight: 700;
}

.alerts-module-card__count {
  min-width: 2.35rem;
  height: 2.35rem;
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
  background: var(--color-warning-container);
  color: color-mix(in srgb, var(--color-warning) 78%, var(--color-on-surface));
}

.alerts-module-card__count--success {
  background: var(--color-success-container);
  color: var(--color-on-success);
}

.alerts-module-card__count--neutral {
  background: var(--color-surface-container-high);
  color: var(--color-on-surface-variant);
}
</style>
