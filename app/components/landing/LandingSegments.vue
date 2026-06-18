<template>
  <section class="segments-section">
    <div class="landing-container">
      <div v-reveal="{ y: 16 }" class="landing-section-head">
        <h2>{{ $t('segments.heading') }}</h2>
        <p>{{ $t('segments.connector') }}</p>
      </div>

      <div class="segments-grid">
        <div v-reveal="{ i: 0 }" class="segment">
          <div class="segment__label">
            <span class="segment__icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="5" width="14" height="9" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <path d="M5 5V4a3 3 0 0 1 6 0v1" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </span>
            {{ $t('segments.fleet.label') }}
          </div>
          <ul class="segment__list">
            <li v-for="item in $tm('segments.fleet.items')" :key="String(item)">
              {{ $rt(item) }}
            </li>
          </ul>
        </div>

        <div class="segments-divider" aria-hidden="true" />

        <div v-reveal="{ i: 1 }" class="segment">
          <div class="segment__label">
            <span class="segment__icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 4.5v3.75l2.5 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </span>
            {{ $t('segments.rental.label') }}
          </div>
          <ul class="segment__list">
            <li v-for="item in $tm('segments.rental.items')" :key="String(item)">
              {{ $rt(item) }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.segments-section {
  padding: var(--space-24) 0;
  background: var(--color-bg);
  border-top: 1px solid var(--color-outline);
  border-bottom: 1px solid var(--color-outline);
}

.segments-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--space-10);
  align-items: start;
}

.segments-divider {
  width: 1px;
  background: var(--color-outline);
  align-self: stretch;
  margin-top: var(--space-2);
}

/* ── Segment ─────────────────────────────────────────────── */

.segment__label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  margin-bottom: var(--space-6);
}

.segment__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.segment__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.segment__list li {
  position: relative;
  padding-left: var(--space-6);
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--color-muted);
  text-wrap: pretty;
}

.segment__list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-primary);
}

/* ── Responsive ──────────────────────────────────────────── */

@media (max-width: 767px) {
  .segments-section {
    padding: var(--space-16) 0;
  }

  .segments-grid {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }

  .segments-divider {
    width: 100%;
    height: 1px;
    margin: 0;
  }
}
</style>
