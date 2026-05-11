<script setup lang="ts">
const { t, locale } = useI18n();
const localePath = useLocalePath();

/** Demo KPI: PL locale always PLN (avoids stale bundles ignoring `pl.json`). */
const heroChartKpi = computed(() => {
  if (locale.value === 'pl') {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      currencyDisplay: 'code',
      maximumFractionDigits: 0,
    }).format(42500);
  }
  return t('landing.visual.chartKpi');
});
</script>

<template>
  <div class="lh">
    <a class="lh-skip" href="#lh-main">{{ t('landing.a11y.skip') }}</a>

    <header class="lh-nav">
      <div class="lh-nav__inner">
        <NuxtLink class="lh-logo" :to="localePath('/')">{{ t('brand') }}</NuxtLink>

        <details class="lh-mnav">
          <summary class="lh-mnav__btn" :aria-label="t('landing.a11y.menu')">
            <span class="material-symbols-outlined" aria-hidden="true">menu</span>
          </summary>
          <nav class="lh-mnav__panel" :aria-label="t('landing.a11y.subNav')">
            <a class="lh-link lh-link--active" href="#lh-capabilities">{{ t('landing.nav.features') }}</a>
            <a class="lh-link" href="#lh-platform">{{ t('landing.nav.platform') }}</a>
            <NuxtLink class="lh-link" :to="localePath('/register')">{{ t('landing.nav.start') }}</NuxtLink>
            <NuxtLink class="lh-link lh-link--emphasis" :to="localePath('/login')">{{ t('landing.nav.login') }}</NuxtLink>
          </nav>
        </details>

        <nav class="lh-nav__links" :aria-label="t('landing.a11y.mainNav')">
          <a class="lh-link lh-link--active" href="#lh-capabilities">{{ t('landing.nav.features') }}</a>
          <a class="lh-link" href="#lh-platform">{{ t('landing.nav.platform') }}</a>
          <NuxtLink class="lh-link" :to="localePath('/register')">{{ t('landing.nav.start') }}</NuxtLink>
        </nav>

        <div class="lh-nav__cta">
          <NuxtLink class="lh-ghost" :to="localePath('/login')">{{ t('landing.nav.login') }}</NuxtLink>
          <NuxtLink class="lh-btn lh-btn--primary" :to="localePath('/register')">{{ t('landing.nav.cta') }}</NuxtLink>
        </div>
      </div>
    </header>

    <main id="lh-main">
      <section class="lh-hero">
        <div class="lh-hero__grid">
          <div class="lh-hero__copy">
            <div class="lh-pill">
              <span class="material-symbols-outlined lh-pill__icon" aria-hidden="true">domain</span>
              <span class="lh-pill__text">{{ t('landing.hero.badge') }}</span>
            </div>
            <h1 class="lh-hero__title">
              {{ t('landing.hero.title1') }}<br >
              <span class="lh-gradient-text">{{ t('landing.hero.title2') }}</span>
            </h1>
            <p class="lh-hero__lead">{{ t('landing.hero.lead') }}</p>
            <div class="lh-hero__actions">
              <NuxtLink class="lh-btn lh-btn--primary lh-btn--lg" :to="localePath('/register')">
                {{ t('landing.hero.ctaPrimary') }}
                <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </NuxtLink>
              <a class="lh-btn lh-btn--secondary lh-btn--lg" href="#lh-capabilities">{{ t('landing.hero.ctaSecondary') }}</a>
            </div>
            <ul class="lh-trust" :aria-label="t('landing.hero.trustLabel')">
              <li class="lh-trust__item">
                <span class="material-symbols-outlined lh-trust__icon" aria-hidden="true">mark_email_read</span>
                {{ t('landing.hero.trust1') }}
              </li>
              <li class="lh-trust__item">
                <span class="material-symbols-outlined lh-trust__icon" aria-hidden="true">admin_panel_settings</span>
                {{ t('landing.hero.trust2') }}
              </li>
              <li class="lh-trust__item">
                <span class="material-symbols-outlined lh-trust__icon" aria-hidden="true">lock_reset</span>
                {{ t('landing.hero.trust3') }}
              </li>
            </ul>
          </div>

          <div class="lh-hero__visual" aria-hidden="true">
            <div class="lh-viz lh-viz--chart">
              <div class="lh-viz__head">
                <div>
                  <p class="lh-viz__label">{{ t('landing.visual.chartLabel') }}</p>
                  <p class="lh-viz__kpi">{{ heroChartKpi }}</p>
                </div>
                <div class="lh-chip">
                  <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0">trending_up</span>
                  {{ t('landing.visual.chartDelta') }}
                </div>
              </div>
              <div class="lh-bars">
                <span class="lh-bar" style="--h: 32%" />
                <span class="lh-bar" style="--h: 48%" />
                <span class="lh-bar" style="--h: 62%" />
                <span class="lh-bar" style="--h: 41%" />
                <span class="lh-bar lh-bar--hot" style="--h: 88%" />
                <span class="lh-bar" style="--h: 71%" />
              </div>
            </div>

            <div class="lh-viz lh-viz--alert">
              <div class="lh-viz__alert-icon">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1">warning</span>
              </div>
              <div>
                <p class="lh-viz__alert-k">{{ t('landing.visual.alertK') }}</p>
                <p class="lh-viz__alert-v">{{ t('landing.visual.alertV') }}</p>
              </div>
            </div>

            <div class="lh-viz lh-viz--card">
              <div class="lh-viz__card-head">
                <span class="material-symbols-outlined lh-viz__card-ic" aria-hidden="true">verified_user</span>
                <h2 class="lh-viz__card-title">{{ t('landing.visual.cardTitle') }}</h2>
              </div>
              <div class="lh-viz__row">
                <div>
                  <p class="lh-viz__plate">{{ t('landing.visual.cardVehicle') }}</p>
                  <p class="lh-viz__sub">{{ t('landing.visual.cardDriver') }}</p>
                </div>
                <span class="lh-viz__until">{{ t('landing.visual.cardUntil') }}</span>
              </div>
              <div class="lh-progress">
                <span class="lh-progress__fill" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="lh-platform" class="lh-section lh-section--tint">
        <div class="lh-wrap lh-section__head">
          <h2 class="lh-h2">{{ t('landing.compare.sectionTitle') }}</h2>
          <p class="lh-sub">{{ t('landing.compare.sectionLead') }}</p>
        </div>
        <div class="lh-compare">
          <div class="lh-compare__col lh-compare__col--muted">
            <div class="lh-compare__title-row">
              <span class="material-symbols-outlined lh-compare__icon" aria-hidden="true">table_chart</span>
              <h3 class="lh-h3">{{ t('landing.compare.badTitle') }}</h3>
            </div>
            <ul class="lh-list">
              <li v-for="i in 3" :key="`b-${i}`" class="lh-list__item">
                <span class="material-symbols-outlined lh-list__x" aria-hidden="true">close</span>
                <div>
                  <p class="lh-list__t">{{ t(`landing.compare.bad${i}Title`) }}</p>
                  <p class="lh-list__d">{{ t(`landing.compare.bad${i}Body`) }}</p>
                </div>
              </li>
            </ul>
          </div>
          <div class="lh-compare__col lh-compare__col--bright">
            <div class="lh-compare__glow" aria-hidden="true" />
            <div class="lh-compare__title-row">
              <span class="material-symbols-outlined lh-compare__icon lh-compare__icon--fill" aria-hidden="true">dashboard</span>
              <h3 class="lh-h3">{{ t('landing.compare.goodTitle') }}</h3>
            </div>
            <ul class="lh-list">
              <li v-for="i in 3" :key="`g-${i}`" class="lh-list__item">
                <span class="material-symbols-outlined lh-list__ok" aria-hidden="true">check_circle</span>
                <div>
                  <p class="lh-list__t">{{ t(`landing.compare.good${i}Title`) }}</p>
                  <p class="lh-list__d">{{ t(`landing.compare.good${i}Body`) }}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="lh-section">
        <div class="lh-wrap">
          <h2 class="lh-h2 lh-h2--bar">{{ t('landing.deep.title') }}</h2>
          <p class="lh-sub lh-sub--center">{{ t('landing.deep.lead') }}</p>
          <div class="lh-cards2">
            <article class="lh-card2 lh-card2--finance">
              <div class="lh-card2__icon lh-card2__icon--finance-brand">
                <span class="material-symbols-outlined" aria-hidden="true">account_balance</span>
              </div>
              <h3 class="lh-h3">{{ t('landing.deep.finTitle') }}</h3>
              <p class="lh-card2__body">{{ t('landing.deep.finBody') }}</p>
              <div class="lh-card2__strip lh-card2__strip--finance">
                <div>
                  <p class="lh-strip-label">{{ t('landing.deep.finStripLabel') }}</p>
                  <p class="lh-strip-value lh-strip-value--blue">{{ t('landing.deep.finStripValue') }}</p>
                </div>
                <span class="material-symbols-outlined lh-strip-ic lh-strip-ic--finance" aria-hidden="true">analytics</span>
              </div>
            </article>
            <article class="lh-card2 lh-card2--compliance">
              <div class="lh-card2__icon lh-card2__icon--success">
                <span class="material-symbols-outlined" aria-hidden="true">health_and_safety</span>
              </div>
              <h3 class="lh-h3">{{ t('landing.deep.compTitle') }}</h3>
              <p class="lh-card2__body">{{ t('landing.deep.compBody') }}</p>
              <div class="lh-card2__strip lh-card2__strip--compliance">
                <div>
                  <p class="lh-strip-label">{{ t('landing.deep.compStripLabel') }}</p>
                  <p class="lh-strip-value lh-strip-value--success">{{ t('landing.deep.compStripValue') }}</p>
                </div>
                <span class="material-symbols-outlined lh-strip-ic lh-strip-ic--compliance" aria-hidden="true">event_note</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="lh-capabilities" class="lh-section lh-section--spacious lh-section--bento">
        <div class="lh-wrap">
          <h2 class="lh-h2 lh-h2--bar">{{ t('landing.bento.title') }}</h2>
          <div class="lh-bento">
            <article class="lh-tile lh-tile--wide">
              <div class="lh-tile__fade" aria-hidden="true" />
              <div class="lh-tile__body">
                <span class="material-symbols-outlined lh-tile__ic lh-tile__ic--fill" aria-hidden="true">local_shipping</span>
                <h3 class="lh-tile__title">{{ t('landing.bento.fleetTitle') }}</h3>
                <p class="lh-tile__text">{{ t('landing.bento.fleetBody') }}</p>
              </div>
              <NuxtLink class="lh-tile__link" :to="localePath('/register')">
                {{ t('landing.bento.fleetLink') }}
                <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </NuxtLink>
            </article>
            <article class="lh-tile">
              <span class="material-symbols-outlined lh-tile__ic" aria-hidden="true">notifications_active</span>
              <h3 class="lh-tile__title lh-tile__title--sm">{{ t('landing.bento.alertsTitle') }}</h3>
              <p class="lh-tile__text">{{ t('landing.bento.alertsBody') }}</p>
            </article>
            <article class="lh-tile">
              <span class="material-symbols-outlined lh-tile__ic" aria-hidden="true">timeline</span>
              <h3 class="lh-tile__title lh-tile__title--sm">{{ t('landing.bento.timelineTitle') }}</h3>
              <p class="lh-tile__text">{{ t('landing.bento.timelineBody') }}</p>
            </article>
            <article class="lh-tile lh-tile--wide">
              <div class="lh-tile__body">
                <span class="material-symbols-outlined lh-tile__ic lh-tile__ic--fill" aria-hidden="true">payments</span>
                <h3 class="lh-tile__title">{{ t('landing.bento.financeTitle') }}</h3>
                <p class="lh-tile__text">{{ t('landing.bento.financeBody') }}</p>
              </div>
              <NuxtLink class="lh-tile__link" :to="localePath('/register')">
                {{ t('landing.bento.financeLink') }}
                <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </NuxtLink>
            </article>
          </div>
        </div>
      </section>
    </main>

    <footer class="lh-footer">
      <div class="lh-footer__inner">
        <div class="lh-footer__brand">
          <p class="lh-footer__name">{{ t('brand') }}</p>
          <p class="lh-footer__tag">{{ t('landing.footer.tagline') }}</p>
        </div>
        <div class="lh-footer__links">
          <NuxtLink class="lh-footer__a" :to="localePath('/login')">{{ t('landing.footer.signIn') }}</NuxtLink>
          <NuxtLink class="lh-footer__a" :to="localePath('/register')">{{ t('landing.footer.createAccount') }}</NuxtLink>
        </div>
        <p class="lh-footer__copy">{{ t('landing.footer.copy') }}</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.lh {
  --lh-emerald: #059669;
  --lh-success: #059669;
  --lh-teal: #0d9488;
  --lh-track: color-mix(in srgb, var(--color-outline-variant) 18%, transparent);
  min-height: 100dvh;
  background: var(--color-surface);
  color: var(--color-on-surface);
}

.lh-skip {
  position: absolute;
  left: -9999px;
  z-index: 100;
  padding: 0.5rem 1rem;
  background: var(--color-secondary-container);
  color: var(--color-on-secondary);
  border-radius: 0.5rem;
}

.lh-skip:focus {
  left: 1rem;
  top: 1rem;
}

.lh-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--color-surface-container-low) 92%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid color-mix(in srgb, var(--color-outline-variant) 12%, transparent);
}

.lh-nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 80rem;
  margin: 0 auto;
  padding: 1rem 1.5rem;
}

.lh-logo {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: var(--color-secondary);
  text-decoration: none;
}

.lh-logo:hover {
  color: var(--color-secondary-container);
}

.lh-nav__links {
  display: none;
  align-items: center;
  gap: 2rem;
}

@media (min-width: 768px) {
  .lh-nav__links {
    display: flex;
  }
}

.lh-link {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-on-surface-variant);
  text-decoration: none;
  padding: 0.25rem 0;
  border-radius: 0.25rem;
}

.lh-link:hover {
  color: var(--color-secondary);
}

.lh-link--active {
  color: var(--color-secondary);
  text-decoration: none;
}

.lh-link--emphasis {
  color: var(--color-secondary);
}

.lh-nav__cta {
  display: none;
  align-items: center;
  gap: 1rem;
}

@media (min-width: 768px) {
  .lh-nav__cta {
    display: flex;
  }
}

.lh-mnav {
  margin-left: auto;
  position: relative;
}

@media (min-width: 768px) {
  .lh-mnav {
    display: none;
  }
}

.lh-mnav__btn {
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  color: var(--color-on-surface);
  background: var(--color-surface-container);
}

.lh-mnav__btn::-webkit-details-marker {
  display: none;
}

.lh-mnav__panel {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  min-width: 12rem;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: var(--color-surface-container-lowest);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-ambient);
  border: 1px solid color-mix(in srgb, var(--color-outline-variant) 15%, transparent);
}

.lh-mnav:not([open]) .lh-mnav__panel {
  display: none;
}

.lh-ghost {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-on-surface);
  text-decoration: none;
}

.lh-ghost:hover {
  color: var(--color-secondary);
}

.lh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  border-radius: 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition:
    opacity 0.15s,
    transform 0.15s,
    box-shadow 0.15s;
}

.lh-btn:active {
  transform: scale(0.98);
}

.lh-btn--primary {
  color: var(--color-on-secondary);
  background: linear-gradient(135deg, var(--color-secondary), var(--color-secondary-container));
}

.lh-btn--primary:hover {
  opacity: 0.92;
}

.lh-btn--secondary {
  color: var(--color-on-surface);
  background: var(--color-surface-container-high);
}

.lh-btn--secondary:hover {
  background: var(--color-surface-container-highest);
}

.lh-btn--lg {
  padding: 1rem 1.75rem;
  font-size: 1rem;
  box-shadow: var(--shadow-ambient);
}

.lh-btn--lg.lh-btn--primary:hover {
  box-shadow: 0 16px 40px rgba(25, 28, 30, 0.1);
}

.lh-hero {
  padding: 3rem 1.5rem 4rem;
  max-width: 80rem;
  margin: 0 auto;
  overflow: hidden;
}

.lh-hero__grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

@media (min-width: 1024px) {
  .lh-hero__grid {
    flex-direction: row;
    align-items: flex-start;
    gap: 4rem;
  }
}

.lh-hero__copy {
  flex: 1;
  min-width: 0;
}

.lh-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  margin-bottom: 2rem;
  background: var(--color-surface-container-low);
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--color-outline-variant) 20%, transparent);
}

.lh-pill__icon {
  font-size: 1.125rem;
  color: var(--color-secondary);
}

.lh-pill__text {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.lh-hero__title {
  margin: 0 0 1.25rem;
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 6vw, 4.25rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.lh-gradient-text {
  background: linear-gradient(135deg, var(--color-secondary), var(--color-secondary-container));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.lh-hero__lead {
  margin: 0 0 2.5rem;
  max-width: 32rem;
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--color-on-surface-variant);
}

.lh-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.lh-trust {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem 1.75rem;
  margin: 3rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.8125rem;
  color: var(--color-on-surface-variant);
}

.lh-trust__item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.lh-trust__icon {
  font-size: 1.125rem;
  color: var(--color-secondary);
  font-variation-settings:
    'FILL' 1,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
}

.lh-hero__visual {
  position: relative;
  flex: 1;
  width: 100%;
  min-height: 28rem;
  max-width: 36rem;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .lh-hero__visual {
    margin: 0;
    max-width: none;
  }
}

.lh-viz {
  position: absolute;
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--color-outline-variant) 15%, transparent);
}

.lh-viz--chart {
  right: 0;
  top: 0;
  width: 90%;
  height: 17rem;
  padding: 1.5rem;
  background: var(--color-surface-container-low);
  display: flex;
  flex-direction: column;
  z-index: 1;
  transform: translateX(4%);
}

.lh-viz__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.lh-viz__label {
  margin: 0 0 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.lh-viz__kpi {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
}

.lh-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-on-secondary);
  background: linear-gradient(135deg, var(--color-secondary), var(--color-secondary-container));
  box-shadow: 0 1px 2px color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.lh-chip .material-symbols-outlined {
  color: inherit;
  font-size: 1.125rem;
}

.lh-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.5rem;
  height: 9rem;
  margin-top: auto;
}

.lh-bar {
  flex: 1;
  height: var(--h);
  border-radius: 0.125rem 0.125rem 0 0;
  background: var(--color-surface-variant);
}

.lh-bar--hot {
  background: color-mix(in srgb, var(--color-secondary-container) 80%, var(--color-surface-variant));
}

.lh-viz--alert {
  right: 41%;
  top: 22%;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow-ambient);
}

.lh-viz__alert-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-error-container);
  color: var(--color-on-error-container);
}

.lh-viz__alert-k {
  margin: 0;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-error);
}

.lh-viz__alert-v {
  margin: 0.125rem 0 0;
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
}

.lh-viz--card {
  right: 6%;
  bottom: 0;
  width: 82%;
  z-index: 3;
  padding: 1.5rem;
  background: var(--color-surface-container-lowest);
  box-shadow: var(--shadow-ambient);
  transform: translateY(1.5rem);
}

.lh-viz__card-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-left: 0.75rem;
  border-left: 4px solid var(--color-secondary);
}

.lh-viz__card-ic {
  color: var(--color-secondary);
}

.lh-viz__card-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
}

.lh-viz__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.lh-viz__plate {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.lh-viz__sub {
  margin: 0.125rem 0 0;
  font-size: 0.75rem;
  color: var(--color-on-surface-variant);
}

.lh-viz__until {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-secondary);
  white-space: nowrap;
}

.lh-progress {
  margin-top: 1rem;
  height: 0.375rem;
  border-radius: 999px;
  background: var(--color-surface-variant);
  overflow: hidden;
}

.lh-progress__fill {
  display: block;
  height: 100%;
  width: 85%;
  border-radius: inherit;
  background: linear-gradient(135deg, var(--color-secondary), var(--color-secondary-container));
}

.lh-section {
  padding: 4rem 1.5rem;
}

.lh-section--tint {
  background: var(--color-surface-container-low);
}

.lh-section--spacious {
  padding-top: 5rem;
  padding-bottom: 5rem;
}

.lh-section--bento {
  background: var(--color-surface-container-low);
}

.lh-wrap {
  max-width: 80rem;
  margin: 0 auto;
}

.lh-section__head {
  text-align: center;
  max-width: 40rem;
  margin: 0 auto 3rem;
}

.lh-h2 {
  margin: 0 0 1rem;
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.lh-h2--bar {
  border-left: 4px solid var(--color-secondary);
  padding-left: 1rem;
}

.lh-sub {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--color-on-surface-variant);
}

.lh-sub--center {
  text-align: center;
  max-width: 36rem;
  margin: -0.5rem auto 2.5rem;
}

.lh-compare {
  display: grid;
  max-width: 80rem;
  margin: 0 auto;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-outline-variant) 20%, transparent);
  box-shadow: var(--shadow-ambient);
}

@media (min-width: 1024px) {
  .lh-compare {
    grid-template-columns: 1fr 1fr;
  }
}

.lh-compare__col {
  padding: 2rem;
}

.lh-compare__col--muted {
  background: var(--color-surface-container-low);
  border-bottom: 1px solid color-mix(in srgb, var(--color-outline-variant) 20%, transparent);
}

@media (min-width: 1024px) {
  .lh-compare__col--muted {
    border-bottom: none;
    border-right: 1px solid color-mix(in srgb, var(--color-outline-variant) 20%, transparent);
  }
}

.lh-compare__col--bright {
  position: relative;
  background: var(--color-surface-bright);
  overflow: hidden;
}

.lh-compare__glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 16rem;
  height: 16rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-secondary-fixed) 35%, transparent);
  filter: blur(48px);
  transform: translate(25%, -40%);
  pointer-events: none;
}

.lh-compare__title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.lh-compare__icon {
  font-size: 2rem;
  color: var(--color-outline);
}

.lh-compare__col--muted .lh-compare__icon {
  color: var(--color-on-surface-variant);
}

.lh-compare__icon--fill {
  color: var(--color-secondary);
  font-variation-settings:
    'FILL' 1,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
}

.lh-h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 800;
}

.lh-compare__col--muted .lh-h3 {
  color: var(--color-on-surface-variant);
}

.lh-list {
  margin: 0;
  padding: 0;
  list-style: none;
  position: relative;
  z-index: 1;
}

.lh-list__item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.lh-list__item:last-child {
  margin-bottom: 0;
}

.lh-list__x {
  color: var(--color-error);
  flex-shrink: 0;
}

.lh-list__ok {
  color: var(--color-secondary);
  flex-shrink: 0;
  font-variation-settings:
    'FILL' 1,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
}

.lh-list__t {
  margin: 0;
  font-weight: 700;
  font-size: 0.9375rem;
}

.lh-list__d {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--color-on-surface-variant);
}

.lh-cards2 {
  display: grid;
  gap: 2rem;
}

@media (min-width: 768px) {
  .lh-cards2 {
    grid-template-columns: 1fr 1fr;
  }
}

.lh-card2 {
  display: flex;
  flex-direction: column;
  min-height: 18rem;
  padding: 2rem;
  background: var(--color-surface-container-lowest);
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--color-outline-variant) 15%, transparent);
}

.lh-card2--finance {
  position: relative;
  overflow: hidden;
  border-color: color-mix(
    in srgb,
    var(--color-outline-variant) 38%,
    color-mix(in srgb, var(--color-secondary) 32%, transparent)
  );
  background: linear-gradient(
    132deg,
    color-mix(in srgb, var(--color-secondary-fixed) 72%, var(--color-surface-container-lowest)) 0%,
    var(--color-surface-container-lowest) 28%,
    color-mix(in srgb, var(--color-secondary) 14%, var(--color-surface-container-lowest)) 62%,
    color-mix(in srgb, var(--color-secondary-container) 22%, var(--color-surface-container-lowest)) 100%
  );
}

.lh-card2--finance::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    198deg,
    color-mix(in srgb, var(--color-secondary-container) 12%, transparent) 0%,
    transparent 42%,
    color-mix(in srgb, var(--color-secondary) 14%, transparent) 100%
  );
  pointer-events: none;
}

.lh-card2--finance > * {
  position: relative;
  z-index: 1;
}

.lh-card2--compliance {
  position: relative;
  overflow: hidden;
  border-color: color-mix(
    in srgb,
    var(--color-outline-variant) 52%,
    color-mix(in srgb, var(--lh-success) 32%, transparent)
  );
  background: linear-gradient(
    128deg,
    var(--color-surface-container-lowest) 0%,
    color-mix(in srgb, var(--lh-success) 7%, var(--color-surface-container-lowest)) 40%,
    color-mix(in srgb, var(--lh-success) 13%, var(--color-surface-container-lowest)) 88%,
    color-mix(in srgb, var(--lh-success) 18%, var(--color-surface-container-lowest)) 100%
  );
}

.lh-card2--compliance::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    195deg,
    transparent 0%,
    transparent 35%,
    color-mix(in srgb, var(--lh-success) 9%, transparent) 100%
  );
  pointer-events: none;
}

.lh-card2--compliance > * {
  position: relative;
  z-index: 1;
}

.lh-card2__icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.lh-card2__icon--blue {
  background: var(--color-secondary-fixed);
  color: var(--color-on-secondary-container);
}

.lh-card2__icon--finance-brand {
  background: linear-gradient(135deg, var(--color-secondary), var(--color-secondary-container));
  color: var(--color-on-secondary);
  box-shadow: 0 1px 3px color-mix(in srgb, var(--color-secondary) 28%, transparent);
}

.lh-card2__icon--teal {
  background: color-mix(in srgb, var(--lh-teal) 18%, var(--color-surface-container-low));
  color: var(--lh-teal);
}

.lh-card2__icon--success {
  background: color-mix(in srgb, var(--lh-success) 16%, var(--color-surface-container-low));
  color: var(--lh-success);
}

.lh-card2__body {
  flex: 1;
  margin: 0 0 1.5rem;
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--color-on-surface-variant);
}

.lh-card2__strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--color-surface-container-low);
  border-radius: 0.75rem;
}

.lh-strip-ic {
  color: var(--color-outline-variant);
}

.lh-card2__strip--finance {
  background: linear-gradient(
    100deg,
    color-mix(in srgb, var(--color-secondary-fixed) 55%, var(--color-surface-container-lowest)) 0%,
    var(--color-surface-container-lowest) 26%,
    color-mix(in srgb, var(--color-secondary) 16%, var(--color-surface-container-low)) 58%,
    color-mix(in srgb, var(--color-secondary-container) 24%, var(--color-surface-container-low)) 100%
  );
  border: 1px solid color-mix(in srgb, var(--color-secondary) 30%, var(--color-outline-variant) 22%);
}

.lh-card2__strip--compliance {
  background: linear-gradient(
    100deg,
    var(--color-surface-container-low) 0%,
    var(--color-surface-container-low) 48%,
    color-mix(in srgb, var(--lh-success) 16%, var(--color-surface-container-low)) 100%
  );
  border: 1px solid color-mix(in srgb, var(--lh-success) 22%, var(--color-outline-variant) 22%);
}

.lh-strip-ic--finance {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  color: var(--color-on-secondary);
  background: linear-gradient(135deg, var(--color-secondary), var(--color-secondary-container));
  box-shadow: 0 1px 3px color-mix(in srgb, var(--color-secondary) 30%, transparent);
}

.lh-strip-ic--compliance {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  color: var(--color-on-secondary);
  background: var(--lh-success);
  box-shadow: 0 1px 3px color-mix(in srgb, var(--lh-success) 45%, transparent);
}

.lh-strip-value--success {
  color: var(--lh-success);
}

.lh-strip-label {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-on-surface-variant);
}

.lh-strip-value {
  margin: 0.125rem 0 0;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 800;
}

.lh-strip-value--blue {
  color: var(--color-secondary);
}

.lh-bento {
  display: grid;
  gap: 1.5rem;
  grid-auto-rows: minmax(14rem, auto);
}

@media (min-width: 768px) {
  .lh-bento {
    grid-template-columns: repeat(3, 1fr);
  }

  .lh-tile--wide {
    grid-column: span 2;
  }
}

.lh-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem;
  background: var(--color-surface-container-lowest);
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--color-outline-variant) 22%, transparent);
  box-shadow:
    0 1px 0 color-mix(in srgb, var(--color-on-surface) 5%, transparent),
    0 10px 28px rgba(25, 28, 30, 0.055);
  transition:
    box-shadow 0.2s,
    border-color 0.2s,
    transform 0.2s;
  overflow: hidden;
}

.lh-tile--wide {
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-secondary-fixed) 38%, var(--color-surface-container-lowest)) 0%,
    var(--color-surface-container-lowest) 55%
  );
  border-color: color-mix(in srgb, var(--color-secondary) 16%, var(--color-outline-variant) 38%);
}

.lh-tile:hover {
  box-shadow: var(--shadow-ambient);
  border-color: color-mix(in srgb, var(--color-secondary) 24%, var(--color-outline-variant) 32%);
}

.lh-tile__fade {
  position: absolute;
  inset: 0 0 0 40%;
  background: linear-gradient(to left, var(--color-secondary-fixed), transparent);
  opacity: 0.22;
  pointer-events: none;
}

.lh-tile__body {
  position: relative;
  z-index: 1;
}

.lh-tile__ic {
  font-size: 2rem;
  color: var(--color-on-surface);
  margin-bottom: 1rem;
  display: block;
}

.lh-tile__ic--fill {
  color: var(--color-secondary);
  font-variation-settings:
    'FILL' 1,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
}

.lh-tile__title {
  margin: 0 0 0.5rem;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 800;
}

.lh-tile__title--sm {
  font-size: 1.0625rem;
}

.lh-tile__text {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--color-on-surface-variant);
  max-width: 26rem;
}

.lh-tile__link {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 1rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-secondary);
  text-decoration: none;
}

.lh-tile__link:hover {
  gap: 0.5rem;
}

.lh-footer {
  padding: 3rem 1.5rem;
  background: var(--color-surface-container-high);
  border-top: 1px solid color-mix(in srgb, var(--color-outline-variant) 12%, transparent);
}

.lh-footer__inner {
  max-width: 80rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .lh-footer__inner {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
  }
}

.lh-footer__name {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 900;
}

.lh-footer__tag {
  margin: 0.5rem 0 0;
  max-width: 20rem;
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
}

.lh-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.5rem;
}

.lh-footer__a {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-on-surface-variant);
  text-decoration: none;
}

.lh-footer__a:hover {
  color: var(--color-secondary);
}

.lh-footer__copy {
  margin: 0;
  width: 100%;
  padding-top: 1.5rem;
  border-top: 1px solid color-mix(in srgb, var(--color-outline-variant) 15%, transparent);
  font-size: 0.8125rem;
  color: var(--color-on-surface-variant);
}

@media (min-width: 768px) {
  .lh-footer__copy {
    width: auto;
    padding-top: 0;
    border-top: none;
    margin-left: auto;
  }
}
</style>
