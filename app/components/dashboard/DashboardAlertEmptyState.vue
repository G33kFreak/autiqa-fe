<script setup lang="ts">
withDefaults(
  defineProps<{
    icon: string;
    title: string;
    copy: string;
    tone?: 'success' | 'neutral';
  }>(),
  { tone: 'success' },
);
</script>

<template>
  <div
    class="dash-alert-empty"
    :class="`dash-alert-empty--${tone}`"
  >
    <div class="dash-alert-empty__mark" aria-hidden="true">
      <span class="material-symbols-outlined dash-alert-empty__icon">{{ icon }}</span>
    </div>
    <div class="dash-alert-empty__copy">
      <p class="dash-alert-empty__title">{{ title }}</p>
      <p class="dash-alert-empty__text">{{ copy }}</p>
    </div>
  </div>
</template>

<style scoped>
.dash-alert-empty {
  flex: 1;
  min-height: 11.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.35rem 1.15rem;
  border-radius: 0.85rem;
  text-align: center;
  background: color-mix(in srgb, var(--color-success) 6%, var(--color-surface-container-lowest));
}

.dash-alert-empty--neutral {
  background: var(--color-surface-container-lowest);
}

.dash-alert-empty__mark {
  position: relative;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-success) 22%, var(--color-surface-container-lowest)) 0%,
    color-mix(in srgb, var(--color-success) 10%, var(--color-surface-container-low)) 100%
  );
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, white 55%, transparent),
    0 0 0 1px color-mix(in srgb, var(--color-success) 14%, transparent),
    0 10px 24px color-mix(in srgb, var(--color-success) 14%, transparent);
}

.dash-alert-empty--neutral .dash-alert-empty__mark {
  background: linear-gradient(
    145deg,
    var(--color-surface-container-low) 0%,
    var(--color-surface-container-highest) 100%
  );
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, white 70%, transparent),
    0 0 0 1px color-mix(in srgb, var(--color-outline-variant) 18%, transparent),
    var(--shadow-ambient);
}

.dash-alert-empty__mark::after {
  content: '';
  position: absolute;
  inset: -0.35rem;
  border-radius: 1rem;
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in srgb, var(--color-success) 20%, transparent) 0%,
    transparent 70%
  );
  z-index: 0;
  pointer-events: none;
}

.dash-alert-empty__icon {
  position: relative;
  z-index: 1;
  font-size: 1.625rem;
  line-height: 1;
  color: var(--color-on-success);
  font-variation-settings:
    'FILL' 1,
    'wght' 500,
    'GRAD' 0,
    'opsz' 24;
}

.dash-alert-empty--neutral .dash-alert-empty__icon {
  color: var(--color-secondary);
}

.dash-alert-empty__copy {
  display: grid;
  gap: 0.35rem;
  max-width: 16rem;
}

.dash-alert-empty__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-on-surface);
  line-height: 1.25;
}

.dash-alert-empty__text {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.5;
  color: var(--color-on-surface-variant);
}
</style>
