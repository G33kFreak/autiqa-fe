<script setup lang="ts">
const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg';
    showWordmark?: boolean;
    tagline?: string;
    /** When true, wordmark uses on-surface color instead of secondary (footer, dark strips). */
    mono?: boolean;
  }>(),
  {
    size: 'md',
    showWordmark: true,
    tagline: undefined,
    mono: false,
  },
);

const markLabel = computed(() => (props.showWordmark ? undefined : t('brand')));
</script>

<template>
  <span
    class="autiqa-logo"
    :class="[`autiqa-logo--${props.size}`, { 'autiqa-logo--mono': props.mono }]"
  >
    <!-- Tile + glyph use CSS fills (SVG url() + var() gradients often render invisible). -->
    <svg
      class="autiqa-logo__mark"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      :aria-label="markLabel"
      focusable="false"
    >
      <rect class="autiqa-logo__tile" width="32" height="32" rx="8" />
      <!-- Fleet "A": legible at 16px; arc reads as coverage/radar, not a chart -->
      <path
        class="autiqa-logo__arc"
        d="M16 6.75a8.25 8.25 0 0 0-6.2 13.85l1.55-1.55a6.25 6.25 0 1 1 9.3 0l1.55 1.55A8.25 8.25 0 0 0 16 6.75Z"
      />
      <path
        class="autiqa-logo__glyph"
        d="M11.25 23.25 16 12.25 20.75 23.25M13.35 19.1h5.3"
        fill="none"
        stroke-width="2.35"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span v-if="showWordmark" class="autiqa-logo__text">
      <span class="autiqa-logo__name">{{ t('brand') }}</span>
      <span v-if="tagline" class="autiqa-logo__tag">{{ tagline }}</span>
    </span>
  </span>
</template>

<style scoped>
.autiqa-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  text-decoration: none;
  color: inherit;
  --logo-tile-start: var(--color-secondary);
  --logo-tile-end: var(--color-secondary-container);
  --logo-glyph: #f4f7fc;
}

.autiqa-logo__mark {
  flex-shrink: 0;
  display: block;
  overflow: visible;
}

.autiqa-logo--sm .autiqa-logo__mark {
  width: 1.75rem;
  height: 1.75rem;
}

.autiqa-logo--md .autiqa-logo__mark {
  width: 2rem;
  height: 2rem;
}

.autiqa-logo--lg .autiqa-logo__mark {
  width: 2.5rem;
  height: 2.5rem;
}

.autiqa-logo__tile {
  fill: var(--logo-tile-start);
  filter: drop-shadow(0 1px 2px color-mix(in srgb, var(--color-secondary) 35%, transparent));
}

.autiqa-logo__arc {
  fill: var(--logo-glyph);
  opacity: 0.96;
}

.autiqa-logo__glyph {
  stroke: var(--logo-glyph);
}

.autiqa-logo__text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.autiqa-logo__name {
  font-family: var(--font-display);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--color-secondary);
}

.autiqa-logo--sm .autiqa-logo__name {
  font-size: 1.0625rem;
}

.autiqa-logo--md .autiqa-logo__name {
  font-size: 1.25rem;
}

.autiqa-logo--lg .autiqa-logo__name {
  font-size: 1.375rem;
}

.autiqa-logo--mono .autiqa-logo__name {
  color: var(--color-on-surface);
}

.autiqa-logo__tag {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1.3;
  color: var(--color-on-surface-variant);
  max-width: 14rem;
}
</style>
