<script setup lang="ts">
const FREE_LIMIT = 3
const MAX_PAID = 40
const PRICE_PER_CAR = 13
const SLIDER_MAX = 50

const carCount = ref(12)

const zone = computed<'free' | 'paid' | 'enterprise'>(() => {
  if (carCount.value <= FREE_LIMIT) return 'free'
  if (carCount.value <= MAX_PAID) return 'paid'
  return 'enterprise'
})

const targetPrice = computed(() =>
  zone.value === 'paid' ? (carCount.value - FREE_LIMIT) * PRICE_PER_CAR : 0,
)

const displayedPrice = ref(targetPrice.value)
let animId: number | null = null

watch(targetPrice, (to) => {
  if (animId !== null) {
    cancelAnimationFrame(animId)
    animId = null
  }
  if (import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    displayedPrice.value = to
    return
  }
  const from = displayedPrice.value
  if (from === to) return
  const duration = 280
  const t0 = performance.now()
  const tick = (now: number) => {
    const p = Math.min((now - t0) / duration, 1)
    displayedPrice.value = Math.round(from + (to - from) * (1 - (1 - p) ** 3))
    if (p < 1) {
      animId = requestAnimationFrame(tick)
    } else {
      animId = null
    }
  }
  animId = requestAnimationFrame(tick)
})

onUnmounted(() => {
  if (animId !== null) cancelAnimationFrame(animId)
})


const displayCount = computed(() =>
  carCount.value > MAX_PAID ? '41+' : String(carCount.value),
)

const thumbPct = computed(() =>
  ((carCount.value - 1) / (SLIDER_MAX - 1)) * 100,
)

const freeBoundaryPct = ((FREE_LIMIT - 1) / (SLIDER_MAX - 1)) * 100
const paidBoundaryPct = ((MAX_PAID - 1) / (SLIDER_MAX - 1)) * 100

const zonePills = [
  { id: 'free' as const, count: 2, priceKey: 'pricing.zoneFreePrice', rangeKey: 'pricing.zoneFreeRange' },
  { id: 'paid' as const, count: 12, priceKey: 'pricing.zonePaidPrice', rangeKey: 'pricing.zonePaidRange' },
  { id: 'enterprise' as const, count: 45, priceKey: 'pricing.zoneEnterprisePrice', rangeKey: 'pricing.zoneEnterpriseRange' },
]

function setZone(id: 'free' | 'paid' | 'enterprise') {
  carCount.value = zonePills.find(p => p.id === id)!.count
}
</script>

<template>
  <section id="pricing" class="pricing-section">
    <div class="landing-container">
      <div v-reveal="{ y: 16 }" class="landing-section-head">
        <h2>{{ $t('pricing.heading') }}</h2>
        <p>{{ $t('pricing.subline') }}</p>
      </div>

      <div v-reveal="{ i: 0, y: 14 }" class="configurator">
        <!-- ── Config panel (left / top on mobile) ──────── -->
        <div class="config">
          <p class="config__label">{{ $t('pricing.sliderQuestion') }}</p>

          <div class="count-display">
            <span class="count-display__n" :class="`count-display__n--${zone}`">{{ displayCount }}</span>
            <span class="count-display__unit">{{ $t('pricing.vehiclesLabel') }}</span>
          </div>

          <div class="slider-root" :class="`zone--${zone}`">
            <!-- Zone background segments -->
            <div class="track-bg" aria-hidden="true">
              <div class="track-zone track-zone--free" :style="{ width: freeBoundaryPct + '%' }" />
              <div class="track-zone track-zone--paid" :style="{ width: (paidBoundaryPct - freeBoundaryPct) + '%' }" />
              <div class="track-zone track-zone--enterprise" />
            </div>
            <!-- Zone boundary tick marks -->
            <div class="track-marker" aria-hidden="true" :style="{ left: freeBoundaryPct + '%' }" />
            <div class="track-marker" aria-hidden="true" :style="{ left: paidBoundaryPct + '%' }" />
            <!-- Progress fill -->
            <div
              class="track-fill"
              aria-hidden="true"
              :style="{ width: thumbPct + '%' }"
            />
            <!-- Native range input (invisible, handles interaction) -->
            <input
              v-model.number="carCount"
              type="range"
              class="slider-input"
              :min="1"
              :max="SLIDER_MAX"
              :aria-label="$t('pricing.sliderQuestion')"
              :aria-valuenow="carCount"
              :aria-valuemin="1"
              :aria-valuemax="SLIDER_MAX"
              :aria-valuetext="`${displayCount} ${$t('pricing.vehiclesLabel')}`"
            />
            <!-- Custom thumb — perfectly centered via CSS, no browser quirks -->
            <div
              class="track-thumb"
              aria-hidden="true"
              :style="{ left: thumbPct + '%' }"
            />
          </div>

          <!-- Zone shortcut pills -->
          <div class="zone-pills">
            <button
              v-for="pill in zonePills"
              :key="pill.id"
              type="button"
              class="zone-pill"
              :class="{ 'zone-pill--active': zone === pill.id, [`zone-pill--${pill.id}`]: true }"
              @click="setZone(pill.id)"
            >
              <span class="zone-pill__price">{{ $t(pill.priceKey) }}</span>
              <span class="zone-pill__range">{{ $t(pill.rangeKey) }}</span>
            </button>
          </div>
        </div>

        <!-- ── Result panel (right / bottom on mobile) ─── -->
        <div class="result">
          <div class="result__content-wrap">
          <Transition name="result-swap" mode="out-in">
            <div v-if="zone === 'enterprise'" key="enterprise" class="result__enterprise">
              <p class="result__enterprise-h">{{ $t('pricing.enterpriseHeading') }}</p>
              <p class="result__enterprise-desc">{{ $t('pricing.enterpriseDesc') }}</p>
            </div>
            <div v-else key="price" class="result__price-block">
              <div class="result__price-row">
                <span class="result__amount">{{ zone === 'free' ? '0' : displayedPrice }}</span>
                <div class="result__price-unit">
                  <span class="result__currency">PLN</span>
                  <span class="result__period">{{ $t('pricing.perMonth') }}</span>
                </div>
              </div>
              <p class="result__meta">
                <template v-if="zone === 'paid'">{{ FREE_LIMIT }} {{ $t('pricing.freeCount') }} + {{ carCount - FREE_LIMIT }} × {{ PRICE_PER_CAR }} PLN</template>
                <template v-else>{{ $t('pricing.freeNote') }}</template>
              </p>
            </div>
          </Transition>
          </div>

          <NuxtLink
            :to="zone === 'enterprise' ? '/contact' : '/register'"
            class="btn result__cta"
            :class="zone === 'enterprise' ? 'btn--ghost-light' : 'result__btn--inverted'"
          >
            {{ $t(zone === 'enterprise' ? 'pricing.ctaEnterprise' : zone === 'free' ? 'pricing.ctaFree' : 'pricing.ctaPaid') }}
          </NuxtLink>

          <ul class="result__feats">
            <li v-for="f in $tm('pricing.features')" :key="String(f)">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" class="feat-icon">
                <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {{ $rt(f) }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ── Section ─────────────────────────────────────────────── */

.pricing-section {
  padding: var(--space-24) 0;
  background: var(--color-bg);
}

/* ── Configurator card ───────────────────────────────────── */

.configurator {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  max-width: 820px;
  margin-inline: auto;
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-float);
  border: 1px solid var(--color-outline);
}

/* ── Config panel (light) ────────────────────────────────── */

.config {
  padding: var(--space-10);
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
}

.config__label {
  margin: 0 0 var(--space-4);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-muted);
}

/* ── Count display ───────────────────────────────────────── */

.count-display {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.count-display__n {
  font-family: var(--font-display);
  font-size: 5rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
  transition: color var(--duration-ui) var(--ease-out);
}

.count-display__n--free {
  color: var(--color-comply);
}

.count-display__n--enterprise {
  color: var(--color-muted);
}

.count-display__unit {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-muted);
  padding-bottom: 0.5rem;
}

/* ── Slider ──────────────────────────────────────────────── */

.slider-root {
  position: relative;
  height: 28px;
  display: flex;
  align-items: center;
  --zone-fill: var(--color-primary);
}

.slider-root.zone--free { --zone-fill: var(--color-comply); }
.slider-root.zone--paid { --zone-fill: var(--color-primary); }
.slider-root.zone--enterprise { --zone-fill: oklch(0.560 0.010 268); }

/* Zone background */
.track-bg {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 4px;
  transform: translateY(-50%);
  border-radius: 999px;
  display: flex;
  overflow: hidden;
  pointer-events: none;
}

.track-zone--free {
  background: var(--color-comply);
  opacity: 0.3;
}

.track-zone--paid {
  background: var(--color-primary);
  opacity: 0.18;
}

.track-zone--enterprise {
  flex: 1;
  background: oklch(0.680 0.010 268);
  opacity: 0.2;
}

/* Zone boundary tick marks */
.track-marker {
  position: absolute;
  top: 50%;
  width: 2px;
  height: 12px;
  background: var(--color-bg);
  border-radius: 1px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;
}

/* Progress fill */
.track-fill {
  position: absolute;
  left: 0;
  top: 50%;
  height: 4px;
  transform: translateY(-50%);
  border-radius: 999px;
  background: var(--zone-fill);
  pointer-events: none;
  transition: background-color var(--duration-ui) var(--ease-out);
}

/* Native range — fully transparent, only handles interaction */
.slider-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  opacity: 0;
  cursor: grab;
  margin: 0;
  padding: 0;
  z-index: 2;
}

.slider-input:active {
  cursor: grabbing;
}

/* Custom thumb div — top: 50% + translateY(-50%) is pixel-perfect on every browser */
.track-thumb {
  position: absolute;
  top: 50%;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  border: 2.5px solid var(--zone-fill);
  box-shadow: 0 1px 6px oklch(0.155 0.018 268 / 0.18);
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;
  transition:
    transform 120ms var(--ease-out),
    box-shadow 120ms var(--ease-out),
    border-color var(--duration-ui) var(--ease-out);
}

.slider-input:hover + .track-thumb {
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow: 0 2px 10px oklch(0.155 0.018 268 / 0.26);
}

.slider-input:active + .track-thumb {
  transform: translate(-50%, -50%) scale(1.05);
}

.slider-input:focus-visible + .track-thumb {
  box-shadow:
    0 0 0 3px oklch(0.375 0.185 268 / 0.30),
    0 1px 6px oklch(0.155 0.018 268 / 0.18);
}

/* ── Zone pills ──────────────────────────────────────────── */

.zone-pills {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
  margin-top: var(--space-6);
}

.zone-pill {
  padding: 0.5rem var(--space-2);
  border: 1.5px solid var(--color-outline);
  border-radius: var(--radius-lg);
  background: transparent;
  cursor: pointer;
  text-align: center;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.zone-pill:hover:not(.zone-pill--active) {
  border-color: oklch(0.700 0.010 268);
  background: var(--color-surface);
}

.zone-pill:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.zone-pill__price {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-ink);
  line-height: 1.2;
  white-space: nowrap;
}

.zone-pill__range {
  display: block;
  font-size: 0.625rem;
  font-weight: 500;
  color: var(--color-muted);
  margin-top: 2px;
  line-height: 1.2;
}

.zone-pill--active.zone-pill--free {
  border-color: var(--color-comply);
  background: var(--color-comply-bg);
}
.zone-pill--active.zone-pill--free .zone-pill__price {
  color: oklch(0.360 0.125 158);
}

.zone-pill--active.zone-pill--paid {
  border-color: var(--color-primary);
  background: var(--color-primary-subtle);
}
.zone-pill--active.zone-pill--paid .zone-pill__price {
  color: var(--color-primary);
}

.zone-pill--active.zone-pill--enterprise {
  border-color: var(--color-muted);
  background: var(--color-surface-mid);
}
.zone-pill--active.zone-pill--enterprise .zone-pill__price {
  color: var(--color-ink);
}

/* ── Result panel (navy) ─────────────────────────────────── */

.result {
  padding: var(--space-10);
  background: var(--color-primary);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  border: 1px solid transparent;
}

.result__content-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Enterprise state */
.result__enterprise {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-3);
}

.result__enterprise-h {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.625rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.15;
  color: var(--color-hero-ink);
}

.result__enterprise-desc {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: oklch(0.820 0.045 270);
}

/* Price state */
.result__price-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.result__price-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.result__amount {
  font-family: var(--font-display);
  font-size: 4rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--color-hero-ink);
  font-variant-numeric: tabular-nums;
}

.result__price-unit {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding-bottom: 0.3rem;
}

.result__currency {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
  color: oklch(0.820 0.045 270);
}

.result__period {
  font-size: 0.8125rem;
  line-height: 1;
  color: oklch(0.820 0.045 270);
}

.result__meta {
  margin: 0;
  font-size: 0.875rem;
  color: oklch(0.750 0.040 270);
  font-variant-numeric: tabular-nums;
}

/* CTA */
.result__cta {
  width: 100%;
  justify-content: center;
}

.result__btn--inverted {
  background: var(--color-hero-ink);
  color: var(--color-primary);
  border: none;
}

.result__btn--inverted:hover {
  background: oklch(0.940 0.005 270);
}

/* Features list */
.result__feats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2) var(--space-4);
}

.result__feats li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.8125rem;
  line-height: 1.3;
  color: oklch(0.820 0.045 270);
}

.feat-icon {
  flex-shrink: 0;
  color: oklch(0.760 0.155 158);
}

/* ── Transition ──────────────────────────────────────────── */

.result-swap-enter-active,
.result-swap-leave-active {
  transition:
    opacity 180ms var(--ease-out),
    transform 180ms var(--ease-out);
}

.result-swap-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.result-swap-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ── Responsive ──────────────────────────────────────────── */

@media (max-width: 759px) {
  .pricing-section {
    padding: var(--space-16) 0;
  }

  .configurator {
    grid-template-columns: 1fr;
    max-width: 480px;
  }

  .count-display__n {
    font-size: 4rem;
  }

  .result__amount {
    font-size: 3.25rem;
  }
}

@media (max-width: 479px) {
  .config,
  .result {
    padding: var(--space-8) var(--space-6);
  }

  .zone-pill__price {
    font-size: 0.6875rem;
  }
}

/* ── Reduced motion ──────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  .result-swap-enter-active,
  .result-swap-leave-active {
    transition: opacity 80ms linear;
    transform: none;
  }

  .result-swap-enter-from,
  .result-swap-leave-to {
    transform: none;
  }

  .count-display__n,
  .track-fill,
  .track-thumb {
    transition: none;
  }
}
</style>
