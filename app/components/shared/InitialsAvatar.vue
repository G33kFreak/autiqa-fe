<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** Full name; initials are derived when `initials` is not set. */
    label?: string;
    /** Optional explicit initials (max 2 displayed). */
    initials?: string;
    size?: 'sm' | 'md' | 'lg';
    /** Overrides default `aria-label` (falls back to `label`). */
    ariaLabel?: string;
  }>(),
  {
    label: '',
    initials: '',
    size: 'md',
    ariaLabel: '',
  },
);

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    const word = parts[0];
    return word.slice(0, 2).toUpperCase();
  }
  const first = parts[0][0] ?? '';
  const last = parts[parts.length - 1][0] ?? '';
  return `${first}${last}`.toUpperCase();
}

const displayInitials = computed(() => {
  const raw = props.initials.trim();
  if (raw.length > 0) {
    return raw.slice(0, 2).toUpperCase();
  }
  return initialsFromName(props.label ?? '');
});

const computedAriaLabel = computed(() => {
  if (props.ariaLabel.trim()) return props.ariaLabel.trim();
  if ((props.label ?? '').trim()) return props.label.trim();
  return displayInitials.value;
});
</script>

<template>
  <div
    class="initials-avatar"
    :class="`initials-avatar--${size}`"
    role="img"
    :aria-label="computedAriaLabel"
  >
    <span class="initials-avatar__text" aria-hidden="true">{{ displayInitials }}</span>
  </div>
</template>

<style scoped>
.initials-avatar {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-secondary-fixed) 85%, var(--color-surface-container-high)) 0%,
    var(--color-secondary-fixed) 100%
  );
  color: var(--color-secondary-container);
  font-family: var(--font-sans);
  font-weight: 700;
  letter-spacing: 0.02em;
  user-select: none;
}

.initials-avatar--sm {
  width: 2rem;
  height: 2rem;
  font-size: 0.625rem;
}

.initials-avatar--md {
  width: 2.5rem;
  height: 2.5rem;
  font-size: 0.75rem;
}

.initials-avatar--lg {
  width: 3rem;
  height: 3rem;
  font-size: 0.875rem;
}

.initials-avatar__text {
  line-height: 1;
}
</style>
