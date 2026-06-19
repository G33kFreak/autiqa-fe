<script setup lang="ts">
import type { IconName } from '~/components/app/Icon.vue';

/**
 * Shared "nothing here yet" state for app surfaces. Teaches what belongs in a
 * section rather than just reporting emptiness: an icon, a plain-spoken title
 * and body, optional example chips ("what goes here"), and a slot for the
 * primary action. One affordance, used consistently across the detail tabs.
 */
withDefaults(
  defineProps<{
    icon: IconName;
    title: string;
    body: string;
    /** Illustrative examples of what belongs here, rendered as quiet chips. */
    hints?: string[];
    /** Accessible label for the example list (e.g. "For example"). */
    hintsLabel?: string;
    /** `dashed` reads as a drop target; `solid` is the calm default. */
    variant?: 'solid' | 'dashed';
    /** Highlights the frame as an active drop target (drag-over). */
    active?: boolean;
  }>(),
  { hints: () => [], hintsLabel: undefined, variant: 'solid', active: false },
);
</script>

<template>
  <div class="es" :class="[`es--${variant}`, { 'es--active': active }]">
    <span class="es__icon" aria-hidden="true">
      <AppIcon :name="icon" :size="26" />
    </span>
    <h3 class="es__title">{{ title }}</h3>
    <p class="es__body">{{ body }}</p>

    <ul v-if="hints.length" class="es__hints" :aria-label="hintsLabel">
      <li v-for="hint in hints" :key="hint" class="es__hint">{{ hint }}</li>
    </ul>

    <div v-if="$slots.default" class="es__action">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.es {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
  padding: clamp(var(--space-8), 6vw, var(--space-16)) var(--space-6);
  border-radius: var(--radius-xl);
  /* A faint lift off the canvas so the state reads as a considered surface,
     not a leftover hole. */
  background: radial-gradient(
    115% 115% at 50% 0%,
    var(--color-surface) 0%,
    var(--color-bg) 62%
  );
  animation: es-rise var(--duration-slow) var(--ease-out);
}

.es--solid {
  border: 1px solid var(--color-outline);
}

/* Dashed border signals a drop target (photos, document upload). */
.es--dashed {
  border: 1.5px dashed var(--color-outline);
  transition: border-color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

/* Active drag-over target: the frame leans navy to confirm the drop zone. */
.es--active {
  border-color: var(--color-primary);
  background: var(--color-primary-subtle);
}

@media (prefers-reduced-motion: reduce) {
  .es--dashed {
    transition: none;
  }
}

.es__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: var(--space-1);
  border-radius: var(--radius-lg);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}

.es__title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-ink);
  text-wrap: balance;
}

.es__body {
  margin: 0;
  max-width: 44ch;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--color-muted);
  text-wrap: pretty;
}

/* ── Example chips ────────────────────────────────────────────
   Quiet, non-interactive — they show the *kinds* of things that
   live here so the section explains itself at a glance. */
.es__hints {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2);
  margin: var(--space-1) 0 0;
  padding: 0;
  list-style: none;
}

.es__hint {
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  background: var(--color-surface-mid);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-muted);
}

.es__action {
  margin-top: var(--space-2);
}

@keyframes es-rise {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .es {
    animation: none;
  }
}
</style>
