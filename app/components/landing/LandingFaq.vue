<script setup lang="ts">
const localePath = useLocalePath()
const openIndex = ref<number | null>(null)

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}
</script>

<template>
  <section id="faq" class="faq-section">
    <div class="landing-container">
      <div v-reveal="{ y: 16 }" class="landing-section-head">
        <h2>{{ $t('faq.heading') }}</h2>
        <p>{{ $t('faq.subline') }}</p>
      </div>

      <div class="faq-list">
        <div
          v-for="(item, i) in $tm('faq.items')"
          :key="i"
          v-reveal="{ i, y: 10 }"
          class="faq-item"
          :class="{ 'faq-item--open': openIndex === i }"
        >
          <button
            :id="`faq-q-${i}`"
            class="faq-question"
            :aria-expanded="openIndex === i"
            :aria-controls="`faq-a-${i}`"
            type="button"
            @click="toggle(i)"
          >
            <span class="faq-question__text">{{ $rt(item.q) }}</span>
            <svg
              class="faq-chevron"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M4.5 6.75L9 11.25L13.5 6.75"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <div
            :id="`faq-a-${i}`"
            class="faq-answer"
            role="region"
            :aria-labelledby="`faq-q-${i}`"
          >
            <div class="faq-answer__inner">
              <p class="faq-answer__text">{{ $rt(item.a) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-reveal="{ y: 12 }" class="faq-cta">
        <span>{{ $t('faq.ctaText') }}</span>
        <NuxtLink :to="localePath('/register')" class="btn btn--primary faq-cta__btn">
          {{ $t('faq.ctaAction') }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ── Section ─────────────────────────────────────────────── */

.faq-section {
  padding: var(--space-24) 0;
  background: var(--color-surface);
  border-top: 1px solid var(--color-outline);
}

/* ── List ────────────────────────────────────────────────── */

.faq-list {
  max-width: 680px;
  margin-inline: auto;
  margin-bottom: var(--space-12);
}

/* ── Item ────────────────────────────────────────────────── */

.faq-item {
  border-bottom: 1px solid var(--color-outline);
}

.faq-item:first-child {
  border-top: 1px solid var(--color-outline);
}

/* ── Question button ─────────────────────────────────────── */

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  width: 100%;
  padding: var(--space-5) 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  color: var(--color-ink);
  transition: color var(--duration-fast) var(--ease-out);
}

.faq-question:hover {
  color: var(--color-primary);
}

.faq-question:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}

.faq-question__text {
  font-size: 1.0625rem;
  font-weight: 600;
  line-height: 1.35;
  flex: 1;
}

/* ── Chevron ─────────────────────────────────────────────── */

.faq-chevron {
  flex-shrink: 0;
  color: var(--color-muted);
  transform: rotate(0deg);
  transition:
    transform 320ms var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.faq-item--open .faq-chevron {
  transform: rotate(180deg);
  color: var(--color-primary);
}

.faq-question:hover .faq-chevron {
  color: var(--color-primary);
}

/* ── Answer — CSS grid-rows height animation ─────────────── */

.faq-answer {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 360ms var(--ease-out);
}

.faq-item--open .faq-answer {
  grid-template-rows: 1fr;
}

.faq-answer__inner {
  overflow: hidden;
  min-height: 0;
}

.faq-answer__text {
  margin: 0;
  padding-bottom: var(--space-5);
  font-size: 0.9375rem;
  font-weight: 400;
  line-height: 1.65;
  color: var(--color-muted);
  max-width: 60ch;
}

/* ── Bottom CTA ──────────────────────────────────────────── */

.faq-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-5);
  flex-wrap: wrap;
  text-align: center;
  padding-top: var(--space-4);
}

.faq-cta span {
  font-size: 1rem;
  font-weight: 400;
  color: var(--color-muted);
}

.faq-cta__btn {
  flex-shrink: 0;
}

/* ── Responsive ──────────────────────────────────────────── */

@media (max-width: 759px) {
  .faq-section {
    padding: var(--space-16) 0;
  }

  .faq-question__text {
    font-size: 1rem;
  }
}

/* ── Reduced motion ──────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  .faq-answer {
    transition: none;
  }

  .faq-chevron {
    transition: none;
  }
}
</style>
