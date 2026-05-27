<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    icon: string;
    assignedLabel: string;
    assignedValue: number | string | null;
    totalLabel: string;
    totalValue: number | string | null;
    addAriaLabel: string;
    tone?: 'electric' | 'success';
  }>(),
  { tone: 'electric' },
);

const emit = defineEmits<{
  add: [];
}>();
</script>

<template>
  <article class="app-stat-card" :class="`app-stat-card--${tone}`">
    <div class="app-stat-card__head">
      <div class="app-stat-card__title-wrap">
        <span class="app-stat-card__icon material-symbols-outlined" aria-hidden="true">{{ icon }}</span>
        <h3 class="app-stat-card__title">{{ title }}</h3>
      </div>
      <button
        type="button"
        class="app-stat-card__add"
        :aria-label="addAriaLabel"
        @click="emit('add')"
      >
        <span class="material-symbols-outlined" aria-hidden="true">add</span>
      </button>
    </div>
    <div class="app-stat-card__metrics">
      <div class="app-stat-card__metric">
        <p class="app-stat-card__metric-label">{{ assignedLabel }}</p>
        <p class="app-stat-card__metric-value">{{ assignedValue ?? '—' }}</p>
      </div>
      <div class="app-stat-card__metric-divider" aria-hidden="true" />
      <div class="app-stat-card__metric">
        <p class="app-stat-card__metric-label">{{ totalLabel }}</p>
        <p class="app-stat-card__metric-value app-stat-card__metric-value--total">{{ totalValue ?? '—' }}</p>
      </div>
    </div>
  </article>
</template>
