<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string;
  value: string;
  delta?: string;
  tone?: 'neutral' | 'good' | 'warn';
}>(), {
  delta: '',
  tone: 'neutral',
});
</script>

<template>
  <article class="kpi-card" :class="`kpi-card--${props.tone}`">
    <p class="kpi-card__label">{{ props.label }}</p>
    <p class="kpi-card__value">{{ props.value }}</p>
    <p v-if="props.delta" class="kpi-card__delta">{{ props.delta }}</p>
  </article>
</template>

<style scoped>
.kpi-card {
  background: var(--color-surface-container-lowest);
  border-radius: 1rem;
  padding: 0.95rem 1rem 1rem;
  min-height: 7.1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.35rem;
  box-shadow: var(--shadow-ambient);
}

.kpi-card__label {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.kpi-card__value {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.35rem, 2vw, 1.75rem);
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: var(--color-on-surface);
}

.kpi-card__delta {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-on-surface-variant);
}

.kpi-card--good .kpi-card__value {
  color: #0f8a46;
}

.kpi-card--warn .kpi-card__value {
  color: var(--color-error);
}
</style>
