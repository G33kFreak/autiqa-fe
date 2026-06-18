<script setup lang="ts">
// Presentational hero visual — demo content, not connected to API

// Pause the infinite float loops when the visual scrolls out of view, so the
// browser stops compositing them every frame. Purely a perf concern — looks
// identical while on-screen.
const scene = ref<HTMLElement | null>(null)
const inView = ref(true)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!scene.value || typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(
    ([entry]) => { inView.value = entry?.isIntersecting ?? true },
    { rootMargin: '120px' },
  )
  observer.observe(scene.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="scene" class="hero-scene" :class="{ 'is-paused': !inView }" role="img" :aria-label="$t('heroVisual.label')">

    <!-- Live driver pill -->
    <div class="pill-live">
      <span class="pill-dot" />
      Adam K.&nbsp;&middot;&nbsp;WI&nbsp;12345&nbsp;&middot;&nbsp;4h&nbsp;17m
    </div>

    <!-- Main fleet table -->
    <div class="card card-fleet">
      <header class="card-head">
        <span class="card-head__label">{{ $t('heroVisual.label') }}</span>
        <span class="card-head__live">
          <span class="live-dot" aria-hidden="true" />
          {{ $t('heroVisual.live') }}
        </span>
      </header>
      <div class="fleet-body">
        <div class="fleet-row fleet-row--header">
          <span>{{ $t('featureFleet.colVehicle') }}</span>
          <span>{{ $t('featureFleet.colDriver') }}</span>
          <span>{{ $t('featureFleet.colStatus') }}</span>
        </div>
        <div class="fleet-row">
          <div class="vc">
            <span class="vc__plate">WI 12345</span>
            <span class="vc__model">Toyota Camry</span>
          </div>
          <span class="fr-driver">Adam K.</span>
          <span class="badge badge--trip">{{ $t('heroVisual.statusOnTrip') }}</span>
        </div>
        <div class="fleet-row">
          <div class="vc">
            <span class="vc__plate">KR 98765</span>
            <span class="vc__model">Honda Accord</span>
          </div>
          <span class="fr-driver">Marek W.</span>
          <span class="badge badge--avail">{{ $t('heroVisual.statusAvailable') }}</span>
        </div>
        <div class="fleet-row fleet-row--last">
          <div class="vc">
            <span class="vc__plate">GD 55100</span>
            <span class="vc__model">BMW 520d</span>
          </div>
          <span class="fr-driver">—</span>
          <span class="badge badge--warn">{{ $t('heroVisual.statusExpiring') }}</span>
        </div>
      </div>
    </div>

    <!-- Revenue card -->
    <div class="card card-revenue">
      <span class="rev-period">{{ $t('heroVisual.thisWeek') }}</span>
      <div class="rev-amount">14&thinsp;280 <span class="rev-curr">zł</span></div>
      <div class="rev-delta">↑ 8%</div>
      <svg
        class="rev-spark"
        viewBox="0 0 116 34"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polyline
          points="0,32 16,26 30,29 46,18 60,22 76,11 94,15 116,3"
          stroke="oklch(0.440 0.140 158)"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="116" cy="3" r="2.5" fill="oklch(0.440 0.140 158)" />
      </svg>
    </div>

    <!-- Compliance alert -->
    <div class="card card-alert">
      <div class="alert-icon" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1.5L12.5 11.5H1.5L7 1.5Z" stroke="oklch(0.420 0.180 26)" stroke-width="1.4" stroke-linejoin="round" />
          <line x1="7" y1="5.5" x2="7" y2="8.5" stroke="oklch(0.420 0.180 26)" stroke-width="1.4" stroke-linecap="round" />
          <circle cx="7" cy="10.5" r="0.7" fill="oklch(0.420 0.180 26)" />
        </svg>
      </div>
      <div class="alert-body">
        <span class="alert-title">{{ $t('features.compliance.title') }}</span>
        <span class="alert-sub">GD 55100 &middot; BMW 520d</span>
      </div>
      <span class="alert-badge">{{ $t('featureCompliance.daysLeft', { n: 3 }) }}</span>
    </div>

  </div>
</template>

<style scoped>

/* ── Scene ────────────────────────────────────────────────── */

.hero-scene {
  /* White-card context — cascades to all children; does NOT affect hero text */
  --color-hero-surface-high: oklch(0.982 0.005 268);
  --color-hero-surface:      oklch(0.970 0.007 268);
  --color-hero-outline:      oklch(0.155 0.018 268 / 0.09);
  --color-hero-ink:          oklch(0.155 0.018 268);
  --color-hero-muted:        oklch(0.455 0.014 268);

  position: relative;
  width: 100%;
  height: 390px;
}

/* ── Shared card shell ────────────────────────────────────── */

.card {
  position: absolute;
  background: var(--color-hero-surface-high);
  border: 1px solid var(--color-hero-outline);
  border-radius: var(--radius-lg);
  box-shadow:
    0 20px 60px oklch(0.08 0.015 268 / 0.40),
    0 4px 14px  oklch(0.08 0.015 268 / 0.18);
  color: var(--color-hero-ink);
}

/* Promote the floating elements to their own GPU layer so the large soft
   shadow rasterizes once and only composites on each frame — instead of
   re-blurring every frame as the card moves. The visual is unchanged; this is
   what makes the float loops cheap on high-pixel external displays. */
.card-fleet,
.card-revenue,
.card-alert,
.pill-live {
  will-change: transform;
}

/* ── Live pill ────────────────────────────────────────────── */

.pill-live {
  position: absolute;
  top: 28px;
  left: 14px;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0.375rem 0.875rem 0.375rem 0.625rem;
  background: var(--color-hero-surface);
  border: 1px solid var(--color-hero-outline);
  border-radius: var(--radius-full);
  box-shadow:
    0 8px 28px oklch(0.08 0.015 268 / 0.32),
    0 2px 8px  oklch(0.08 0.015 268 / 0.14);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-hero-ink);
  white-space: nowrap;
  animation:
    pill-enter 0.50s var(--ease-out) 0.55s both,
    float-pill 5.8s  ease-in-out    1.05s infinite;
}

.pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: oklch(0.440 0.140 158);
  flex-shrink: 0;
  animation: dot-pulse 2.1s ease-in-out infinite;
}

/* ── Fleet card ───────────────────────────────────────────── */

.card-fleet {
  top: 66px;
  left: 0;
  right: 32px;
  padding: var(--space-5);
  z-index: 1;
  animation:
    fleet-enter 0.60s var(--ease-out) 0.10s both,
    float-main  7.4s  ease-in-out    0.70s infinite;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.card-head__label {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-hero-muted);
}

.card-head__live {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.625rem;
  font-weight: 600;
  color: oklch(0.440 0.140 158);
}

.live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: oklch(0.440 0.140 158);
  animation: dot-pulse 2.2s ease-in-out 0.4s infinite;
}

.fleet-body {
  display: flex;
  flex-direction: column;
}

.fleet-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--space-3);
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-hero-outline);
}

.fleet-row--header {
  font-size: 0.5625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-hero-muted);
  padding-top: 0;
  padding-bottom: 8px;
}

.fleet-row--last {
  border-bottom: none;
  padding-bottom: 0;
}

.vc {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.vc__plate {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  font-variant-numeric: tabular-nums;
}

.vc__model {
  font-size: 0.625rem;
  color: var(--color-hero-muted);
}

.fr-driver {
  font-size: 0.75rem;
  color: var(--color-hero-muted);
  white-space: nowrap;
}

.badge {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.2em 0.55em;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.badge--trip  { color: oklch(0.440 0.140 158); background: oklch(0.440 0.140 158 / 0.10); }
.badge--avail { color: var(--color-hero-muted); background: oklch(0.155 0.018 268 / 0.07); }
.badge--warn  { color: oklch(0.420 0.180  26); background: oklch(0.420 0.180  26 / 0.10); }

/* ── Revenue card ─────────────────────────────────────────── */

.card-revenue {
  top: 0;
  right: 0;
  width: 148px;
  padding: var(--space-4);
  z-index: 3;
  animation:
    rev-enter  0.55s var(--ease-out) 0.25s both,
    float-rev  6.3s  ease-in-out    0.80s infinite;
}

.rev-period {
  font-size: 0.5625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-hero-muted);
}

.rev-amount {
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1;
  margin: 6px 0 3px;
  font-variant-numeric: tabular-nums;
}

.rev-curr {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-hero-muted);
}

.rev-delta {
  font-size: 0.625rem;
  font-weight: 600;
  color: oklch(0.440 0.140 158);
  margin-bottom: var(--space-3);
}

.rev-spark {
  width: 100%;
  height: 34px;
  display: block;
}

/* ── Compliance alert card ────────────────────────────────── */

.card-alert {
  top: 268px;
  left: 0;
  width: 206px;
  padding: 10px var(--space-4);
  z-index: 4;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  animation:
    alert-enter 0.55s var(--ease-out) 0.40s both,
    float-alert 8.7s  ease-in-out    0.95s infinite;
}

.alert-icon {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: oklch(0.420 0.180 26 / 0.20);
  display: flex;
  align-items: center;
  justify-content: center;
}


.alert-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.alert-title {
  font-size: 0.6875rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alert-sub {
  font-size: 0.5625rem;
  color: var(--color-hero-muted);
  white-space: nowrap;
}

.alert-badge {
  flex-shrink: 0;
  font-size: 0.5625rem;
  font-weight: 700;
  padding: 0.25em 0.6em;
  border-radius: var(--radius-full);
  background: oklch(0.420 0.180 26 / 0.18);
  color: oklch(0.420 0.180 26);
  white-space: nowrap;
}

/* ── Entry keyframes ──────────────────────────────────────── */

@keyframes fleet-enter {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes rev-enter {
  from { opacity: 0; transform: translate(20px, -14px); }
  to   { opacity: 1; transform: translate(0, 0); }
}

@keyframes alert-enter {
  from { opacity: 0; transform: translate(-18px, 18px); }
  to   { opacity: 1; transform: translate(0, 0); }
}

@keyframes pill-enter {
  from { opacity: 0; transform: translateY(-14px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Float keyframes — never synchronized ─────────────────── */

@keyframes float-main {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-9px); }
}

@keyframes float-rev {
  0%, 100% { transform: translate(0, 0); }
  38%       { transform: translate(2px, -13px); }
  74%       { transform: translate(-1px, -6px); }
}

@keyframes float-alert {
  0%, 100% { transform: translate(0, 0); }
  47%       { transform: translate(1px, -8px); }
}

@keyframes float-pill {
  0%, 100% { transform: translate(0, 0); }
  42%       { transform: translate(2px, -14px); }
  79%       { transform: translate(-1px, -7px); }
}

@keyframes dot-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.40; transform: scale(0.78); }
}

/* ── Paused off-screen (perf; no visual change while in view) ── */

.hero-scene.is-paused :is(
  .pill-live,
  .pill-dot,
  .card-fleet,
  .live-dot,
  .card-revenue,
  .card-alert
) {
  animation-play-state: paused;
}

/* ── Reduced motion ───────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  .card-fleet,
  .card-revenue,
  .card-alert,
  .pill-live {
    animation: none;
    opacity: 1;
    transform: none;
  }
  .pill-dot,
  .live-dot {
    animation: none;
  }
}

/* ── Responsive ───────────────────────────────────────────── */

@media (max-width: 480px) {
  .hero-scene   { height: 330px; }
  .pill-live    { font-size: 0.6875rem; }
  .card-fleet   { top: 52px; right: 24px; }
  .card-revenue { width: 126px; }
  .card-alert   { top: 226px; width: 190px; font-size: 0.625rem; }
}
</style>
