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
  <article class="app-kpi kpi-card" :class="`app-kpi--${props.tone} kpi-card--${props.tone}`">
    <p class="app-kpi__label kpi-card__label">{{ props.label }}</p>
    <p class="app-kpi__value kpi-card__value">{{ props.value }}</p>
    <p v-if="props.delta" class="kpi-card__delta">{{ props.delta }}</p>
  </article>
</template>

<style scoped>
.kpi-card__delta {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-on-surface-variant);
}
</style>
