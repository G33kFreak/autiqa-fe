<script setup lang="ts">
defineProps<{
  light?: boolean
  size?: number
}>()
</script>

<template>
  <div class="autiqa-logo" :class="{ 'autiqa-logo--light': light }">
    <svg
      :width="size ?? 28"
      :height="size ?? 28"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <rect
        width="32"
        height="32"
        rx="7"
        :fill="light ? 'white' : 'var(--color-primary)'"
      />
      <path
        d="M16 7L24.5 25M16 7L7.5 25M10.5 19.5L21.5 19.5"
        :stroke="light ? 'var(--color-primary)' : 'white'"
        stroke-width="2.75"
        stroke-linecap="square"
      />
    </svg>
    <span class="autiqa-logo__name">Autiqa</span>
  </div>
</template>

<style scoped>
.autiqa-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  user-select: none;
}

.autiqa-logo__name {
  font-family: var(--font-sans);
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: var(--color-ink);
  line-height: 1;
}

.autiqa-logo--light .autiqa-logo__name {
  color: var(--color-hero-ink);
}
</style>
