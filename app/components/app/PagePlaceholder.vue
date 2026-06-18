<script setup lang="ts">
const { t } = useI18n();

defineProps<{
  title: string;
  lede: string;
}>();
</script>

<template>
  <section class="placeholder">
    <div class="placeholder__inner">
      <span class="placeholder__chip">
        <span class="placeholder__dot" aria-hidden="true" />
        {{ t('app.pages.badge') }}
      </span>
      <h1 class="placeholder__title">{{ title }}</h1>
      <p class="placeholder__lede">{{ lede }}</p>
    </div>
  </section>
</template>

<style scoped>
.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100dvh - 65px - var(--space-10) * 2);
}

.placeholder__inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-4);
  max-width: 32rem;
}

.placeholder__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.3rem 0.75rem;
  background: var(--color-surface-mid);
  color: var(--color-muted);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  border-radius: var(--radius-full);
}

.placeholder__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-warn);
}

.placeholder__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--color-ink);
  text-wrap: balance;
}

.placeholder__lede {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-muted);
  text-wrap: pretty;
}

@media (max-width: 768px) {
  .placeholder {
    justify-content: flex-start;
    min-height: 0;
    padding-top: var(--space-8);
  }
}
</style>
