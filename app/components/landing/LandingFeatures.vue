<template>
  <section id="features" class="features-section">
    <div class="landing-container">
      <div v-reveal="{ y: 16 }" class="landing-section-head">
        <h2>{{ $t('features.heading') }}</h2>
      </div>

      <div class="features-grid">
        <!-- Fleet management — full-width table visual -->
        <div v-reveal="{ i: 0, y: 28 }" class="feature-item feature-item--fleet">
          <LandingFleetFeature />
          <div class="feature-item__caption">
            <h3 class="feature-item__title">{{ $t('features.fleet.title') }}</h3>
            <p class="feature-item__desc">{{ $t('features.fleet.description') }}</p>
          </div>
        </div>

        <!-- Finance + Compliance — stacked in right column -->
        <div class="feature-item__stack">
          <div v-reveal="{ i: 1, y: 28 }" class="feature-item">
            <LandingFinanceFeature />
            <div class="feature-item__caption">
              <h3 class="feature-item__title">{{ $t('features.finance.title') }}</h3>
              <p class="feature-item__desc">{{ $t('features.finance.description') }}</p>
            </div>
          </div>

          <div v-reveal="{ i: 2, y: 28 }" class="feature-item">
            <LandingComplianceFeature />
            <div class="feature-item__caption">
              <h3 class="feature-item__title">{{ $t('features.compliance.title') }}</h3>
              <p class="feature-item__desc">{{ $t('features.compliance.description') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features-section {
  padding: var(--space-24) 0;
  background: var(--color-dark-bg);
}

/* Override global section head for dark context */
.landing-section-head h2 {
  color: var(--color-dark-ink);
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
  align-items: start;
}

.feature-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.feature-item__stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.feature-item__caption {
  padding: 0 var(--space-2);
}

.feature-item__title {
  margin: 0 0 var(--space-2);
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.2;
  color: var(--color-dark-ink);
}

.feature-item__desc {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--color-dark-muted);
  max-width: 42ch;
  text-wrap: pretty;
}

@media (max-width: 1023px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .features-section {
    padding: var(--space-16) 0;
  }
}
</style>
