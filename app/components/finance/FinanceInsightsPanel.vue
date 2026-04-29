<script setup lang="ts">
const props = defineProps<{
  insights: string[];
}>();

const { t } = useI18n();
</script>

<template>
  <section class="insights">
    <div class="insights__head">
      <p class="insights__label">{{ t('appSections.finance.insights.label') }}</p>
      <h2 class="insights__title">{{ t('appSections.finance.insights.title') }}</h2>
    </div>
    <ul class="insights__list">
      <li v-for="(item, idx) in props.insights" :key="idx" class="insights__item">
        {{ item }}
      </li>
    </ul>
  </section>
</template>

<style scoped>
.insights {
  background: var(--color-surface-container-low);
  border-radius: 1rem;
  padding: 1rem;
}

.insights__label {
  margin: 0;
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
  font-weight: 700;
}

.insights__title {
  margin: 0.15rem 0 0.9rem;
  font-size: 1.15rem;
  font-family: var(--font-display);
  letter-spacing: -0.02em;
}

.insights__list {
  margin: 0;
  padding-left: 1rem;
  display: grid;
  gap: 0.65rem;
}

.insights__item {
  font-size: 0.84rem;
  color: var(--color-on-surface);
  line-height: 1.45;
}
</style>
