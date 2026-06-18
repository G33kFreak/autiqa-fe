<script setup lang="ts">
const localePath = useLocalePath()
</script>

<template>
  <section class="hero">
    <div class="hero__container landing-container">
      <div class="hero__content">
        <div class="hero__text">
          <h1 class="hero__headline">
            <span class="hero__headline-setup">{{ $t('hero.headlineA') }}</span>
            <strong class="hero__headline-punch">{{ $t('hero.headlineB') }}</strong>
          </h1>
          <p class="hero__subline">{{ $t('hero.subline') }}</p>
          <div class="hero__actions">
            <NuxtLink :to="localePath('/register')" class="btn btn--hero-cta">
              {{ $t('hero.cta') }}
            </NuxtLink>
            <span class="hero__cta-meta">{{ $t('hero.ctaMeta') }}</span>
          </div>
        </div>

        <div class="hero__visual">
          <LandingHeroVisual />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  background: var(--color-hero-bg);
  padding-top: calc(4.5rem + var(--space-16));
  padding-bottom: var(--space-20);
  min-height: 100svh;
  display: flex;
  align-items: center;
}

.hero__container {
  width: 100%;
}

.hero__content {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: var(--space-16);
  align-items: center;
}

/* ── Text column ─────────────────────────────────────────── */

.hero__text {
  animation: hero-enter 0.55s var(--ease-out) both;
}

.hero__headline {
  margin: 0 0 var(--space-8);
  font-family: var(--font-display);
  text-wrap: balance;
}

.hero__headline-setup {
  display: block;
  font-size: clamp(0.9375rem, 1.4vw, 1.125rem);
  font-weight: 400;
  letter-spacing: 0.02em;
  color: var(--color-hero-muted);
  margin-bottom: 0.3em;
  line-height: 1.4;
}

.hero__headline-punch {
  display: block;
  font-size: clamp(2.75rem, 6.5vw, 5.5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 0.92;
  color: var(--color-hero-ink);
  overflow-wrap: break-word;
}

.hero__subline {
  margin: 0 0 var(--space-10);
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  font-weight: 300;
  line-height: 1.7;
  color: var(--color-hero-muted);
  max-width: 46ch;
  text-wrap: pretty;
}

.hero__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  align-items: flex-start;
}

.btn--hero-cta {
  display: inline-flex;
  align-items: center;
  padding: 0.9375rem 1.875rem;
  background: var(--color-hero-ink);
  color: var(--color-primary);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  text-decoration: none;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.btn--hero-cta:hover {
  background: oklch(0.940 0.005 270);
}

.btn--hero-cta:active {
  transform: scale(0.98);
}

.hero__cta-meta {
  font-size: 0.8125rem;
  font-weight: 300;
  color: oklch(0.640 0.030 272);
}

/* ── Visual column ───────────────────────────────────────── */

.hero__visual {
  /* entrance handled per-element inside LandingHeroVisual */
}

/* ── Entrance animation ──────────────────────────────────── */

@keyframes hero-enter {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__text,
  .hero__visual {
    animation: none;
  }
}

/* ── Responsive ──────────────────────────────────────────── */

@media (max-width: 1023px) {
  .hero__content {
    grid-template-columns: 1fr;
    gap: var(--space-12);
  }

  .hero {
    min-height: auto;
    padding-bottom: var(--space-16);
  }
}

@media (max-width: 767px) {
  .hero {
    padding-top: calc(4.5rem + var(--space-10));
    padding-bottom: var(--space-12);
  }

  .hero__subline {
    max-width: none;
  }
}
</style>
