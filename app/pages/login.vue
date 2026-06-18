<script setup lang="ts">
import { FetchError } from 'ofetch'
import { StatusCodes } from 'http-status-codes'

definePageMeta({ layout: false })

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const pending = ref(false)
const formError = ref('')

/** Only honour same-origin redirect targets. */
function safeRedirect(): string {
  const q = route.query.redirect
  return typeof q === 'string' && q.startsWith('/') && !q.startsWith('//')
    ? q
    : localePath('/app')
}

async function submit() {
  if (pending.value) return
  formError.value = ''

  const trimmedEmail = email.value.trim()
  if (!trimmedEmail || !password.value) {
    formError.value = t('login.errors.required')
    return
  }

  pending.value = true
  try {
    await authStore.login(trimmedEmail, password.value)
    await navigateTo(safeRedirect())
  } catch (e: unknown) {
    const status = e instanceof FetchError ? (e.status ?? e.statusCode) : 0
    formError.value =
      status === StatusCodes.UNAUTHORIZED || status === StatusCodes.FORBIDDEN
        ? t('login.errors.invalid')
        : t('login.errors.generic')
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="login-root">

    <!-- ── Brand panel ──────────────────────────────────────── -->
    <aside class="login-brand" aria-hidden="true">
      <div class="login-brand__glow" />
      <div class="login-brand__inner">

        <NuxtLink :to="localePath('/')" class="login-brand__logo">
          <AutiqaLogo :light="true" :size="30" />
        </NuxtLink>

        <div class="login-brand__content">
          <h1 class="login-brand__headline">{{ $t('login.brandHeadline') }}</h1>
          <p class="login-brand__lede">{{ $t('login.brandLede') }}</p>
        </div>

        <!-- Mini product visual -->
        <div class="lv">
          <!-- Fleet status card -->
          <div class="lv-card lv-fleet">
            <div class="lv-fleet__head">
              <span class="lv-meta-label">{{ $t('heroVisual.label') }}</span>
              <span class="lv-live">
                <span class="lv-live__dot" />
                {{ $t('heroVisual.live') }}
              </span>
            </div>
            <div class="lv-fleet__rows">
              <div class="lv-row lv-row--thead">
                <span>{{ $t('featureFleet.colVehicle') }}</span>
                <span>{{ $t('featureFleet.colStatus') }}</span>
              </div>
              <div class="lv-row">
                <div class="lv-vinfo">
                  <span class="lv-plate">WI 12345</span>
                  <span class="lv-model">Toyota Camry</span>
                </div>
                <span class="lv-chip lv-chip--trip">{{ $t('heroVisual.statusOnTrip') }}</span>
              </div>
              <div class="lv-row">
                <div class="lv-vinfo">
                  <span class="lv-plate">KR 98765</span>
                  <span class="lv-model">Honda Accord</span>
                </div>
                <span class="lv-chip lv-chip--avail">{{ $t('heroVisual.statusAvailable') }}</span>
              </div>
              <div class="lv-row lv-row--last">
                <div class="lv-vinfo">
                  <span class="lv-plate">GD 55100</span>
                  <span class="lv-model">BMW 520d</span>
                </div>
                <span class="lv-chip lv-chip--warn">{{ $t('heroVisual.statusExpiring') }}</span>
              </div>
            </div>
          </div>

          <!-- Compliance alert -->
          <div class="lv-card lv-alert">
            <div class="lv-alert__icon">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1.5L12.5 11.5H1.5L7 1.5Z" stroke="oklch(0.420 0.180 26)" stroke-width="1.5" stroke-linejoin="round" />
                <line x1="7" y1="5.5" x2="7" y2="8.5" stroke="oklch(0.420 0.180 26)" stroke-width="1.5" stroke-linecap="round" />
                <circle cx="7" cy="10.5" r="0.75" fill="oklch(0.420 0.180 26)" />
              </svg>
            </div>
            <div class="lv-alert__body">
              <span class="lv-alert__title">{{ $t('features.compliance.title') }}</span>
              <span class="lv-alert__sub">GD 55100 &middot; BMW 520d</span>
            </div>
            <span class="lv-alert__days">{{ $t('featureCompliance.daysLeft', { n: 3 }) }}</span>
          </div>
        </div>

      </div>
    </aside>

    <!-- ── Form panel ───────────────────────────────────────── -->
    <main class="login-main">
      <div class="login-form-wrap">

        <div class="login-mobile-logo">
          <AutiqaLogo :size="26" />
        </div>

        <header class="login-head">
          <h2 class="login-title">{{ $t('login.title') }}</h2>
          <p class="login-subtitle">{{ $t('login.subtitle') }}</p>
        </header>

        <form class="login-form" novalidate :aria-busy="pending" @submit.prevent="submit">

          <transition name="lf-banner">
            <div v-if="formError" class="lf-error" role="alert">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4" />
                <line x1="8" y1="4.75" x2="8" y2="8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                <circle cx="8" cy="11" r="0.7" fill="currentColor" />
              </svg>
              <span>{{ formError }}</span>
            </div>
          </transition>

          <div class="lf-field">
            <label class="lf-label" for="l-email">{{ $t('login.emailLabel') }}</label>
            <input
              id="l-email"
              v-model="email"
              type="email"
              class="lf-input"
              :placeholder="$t('login.emailPlaceholder')"
              autocomplete="email"
              inputmode="email"
              :disabled="pending"
            />
          </div>

          <div class="lf-field">
            <div class="lf-label-row">
              <label class="lf-label" for="l-password">{{ $t('login.passwordLabel') }}</label>
              <NuxtLink :to="localePath('/forgot-password')" class="lf-forgot">{{ $t('login.forgotPassword') }}</NuxtLink>
            </div>
            <input
              id="l-password"
              v-model="password"
              type="password"
              class="lf-input"
              :placeholder="$t('login.passwordPlaceholder')"
              autocomplete="current-password"
              :disabled="pending"
            />
          </div>

          <button type="submit" class="lf-submit" :disabled="pending">
            {{ pending ? $t('login.submitPending') : $t('login.submit') }}
          </button>

        </form>

        <p class="login-foot">
          {{ $t('login.footerLead') }}
          <NuxtLink :to="localePath('/register')" class="login-foot__link">{{ $t('login.requestAccess') }}</NuxtLink>
        </p>

        <NuxtLink :to="localePath('/')" class="login-back">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 2.5L4 7L9 11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ $t('login.backToHome') }}
        </NuxtLink>

      </div>
    </main>

  </div>
</template>

<style scoped>
/* ── Root ──────────────────────────────────────────────────── */

.login-root {
  min-height: 100dvh;
  display: flex;
}

/* ── Brand panel ───────────────────────────────────────────── */

.login-brand {
  position: relative;
  width: 44%;
  flex-shrink: 0;
  background: var(--color-hero-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* Decorative entrance — aria-hidden, never gates user content */
  animation: brand-enter 0.55s var(--ease-out) forwards;
}

/* Radial glow for depth */
.login-brand__glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 55% at 30% 20%, oklch(0.52 0.14 268 / 0.45) 0%, transparent 70%),
    radial-gradient(ellipse 50% 40% at 80% 85%, oklch(0.28 0.20 268 / 0.35) 0%, transparent 65%);
  pointer-events: none;
}

.login-brand__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2.5rem;
  gap: var(--space-10);
}

/* Logo */
.login-brand__logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}

/* Headline + lede */
.login-brand__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-brand__headline {
  margin: 0 0 var(--space-4);
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 2.8vw, 2.75rem);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.05;
  color: var(--color-hero-ink);
  text-wrap: balance;
}

.login-brand__lede {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 300;
  line-height: 1.65;
  color: var(--color-hero-muted);
  max-width: 36ch;
  text-wrap: pretty;
}

/* ── Mini product visual ───────────────────────────────────── */

.lv {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex-shrink: 0;
}

/* Shared card shell (overrides hero context tokens to light-card style) */
.lv-card {
  --color-hero-surface-high: oklch(0.982 0.005 268);
  --color-hero-surface:      oklch(0.970 0.007 268);
  --color-hero-outline:      oklch(0.155 0.018 268 / 0.09);
  --color-hero-ink:          oklch(0.155 0.018 268);
  --color-hero-muted:        oklch(0.455 0.014 268);

  background: var(--color-hero-surface-high);
  border: 1px solid var(--color-hero-outline);
  border-radius: var(--radius-lg);
  box-shadow:
    0 20px 60px oklch(0.08 0.015 268 / 0.50),
    0 4px 16px oklch(0.08 0.015 268 / 0.22);
}

/* Fleet card */
.lv-fleet {
  padding: var(--space-4) var(--space-5);
}

.lv-fleet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.lv-meta-label {
  font-size: 0.5625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-hero-muted);
}

.lv-live {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.5625rem;
  font-weight: 600;
  color: oklch(0.440 0.140 158);
}

.lv-live__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: oklch(0.440 0.140 158);
  animation: dot-pulse 2.2s ease-in-out infinite;
}

.lv-fleet__rows {
  display: flex;
  flex-direction: column;
}

.lv-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-3);
  align-items: center;
  padding: 7px 0;
  border-bottom: 1px solid var(--color-hero-outline);
  color: var(--color-hero-ink);
}

.lv-row--thead {
  font-size: 0.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-hero-muted);
  padding-top: 0;
  padding-bottom: 6px;
}

.lv-row--last {
  border-bottom: none;
  padding-bottom: 0;
}

.lv-vinfo {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.lv-plate {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  font-variant-numeric: tabular-nums;
  color: var(--color-hero-ink);
}

.lv-model {
  font-size: 0.5625rem;
  color: var(--color-hero-muted);
}

.lv-chip {
  font-size: 0.5625rem;
  font-weight: 600;
  padding: 0.2em 0.55em;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.lv-chip--trip  { color: oklch(0.440 0.140 158); background: oklch(0.440 0.140 158 / 0.12); }
.lv-chip--avail { color: oklch(0.455 0.014 268); background: oklch(0.155 0.018 268 / 0.07); }
.lv-chip--warn  { color: oklch(0.420 0.180  26); background: oklch(0.420 0.180  26 / 0.12); }

/* Alert card */
.lv-alert {
  padding: 9px var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.lv-alert__icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: oklch(0.420 0.180 26 / 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lv-alert__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.lv-alert__title {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-hero-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lv-alert__sub {
  font-size: 0.5625rem;
  color: var(--color-hero-muted);
  white-space: nowrap;
}

.lv-alert__days {
  flex-shrink: 0;
  font-size: 0.5625rem;
  font-weight: 700;
  padding: 0.25em 0.65em;
  border-radius: var(--radius-full);
  background: oklch(0.420 0.180 26 / 0.18);
  color: oklch(0.420 0.180 26);
  white-space: nowrap;
}

/* ── Form panel ────────────────────────────────────────────── */

.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: var(--space-8);
  min-height: 100dvh;
}

.login-form-wrap {
  width: 100%;
  max-width: 22rem;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Mobile logo: only shown on small screens */
.login-mobile-logo {
  display: none;
}

/* Form heading */
.login-head {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.login-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.625rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.15;
  color: var(--color-ink);
}

.login-subtitle {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 400;
  line-height: 1.55;
  color: var(--color-muted);
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* Field */
.lf-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.lf-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.lf-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-ink);
  line-height: 1;
}

.lf-forgot {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-muted);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out);
  white-space: nowrap;
}

.lf-forgot:hover {
  color: var(--color-primary);
}

.lf-input {
  width: 100%;
  padding: 0.6875rem 0.875rem;
  background: var(--color-surface);
  border: 1.5px solid var(--color-outline);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 400;
  color: var(--color-ink);
  line-height: 1.4;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
  outline: none;
  appearance: none;
}

.lf-input::placeholder {
  color: var(--color-muted);
  opacity: 0.55;
}

.lf-input:hover {
  border-color: oklch(0.680 0.012 268);
}

.lf-input:focus {
  border-color: var(--color-primary);
  background: var(--color-bg);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

/* Submit */
.lf-submit {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.2;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.lf-submit:hover {
  background: var(--color-primary-hover);
  box-shadow: 0 4px 16px var(--color-primary-subtle);
}

.lf-submit:active {
  transform: scale(0.985);
}

.lf-submit:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

.lf-submit:disabled {
  opacity: 0.65;
  cursor: progress;
  box-shadow: none;
}

/* Error banner */
.lf-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0.6875rem 0.875rem;
  border: 1px solid oklch(0.420 0.180 26 / 0.30);
  border-radius: var(--radius-md);
  background: oklch(0.420 0.180 26 / 0.07);
  color: oklch(0.420 0.180 26);
  font-size: 0.875rem;
  line-height: 1.4;
}

.lf-error svg {
  flex-shrink: 0;
}

.lf-banner-enter-active,
.lf-banner-leave-active {
  transition:
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.lf-banner-enter-from,
.lf-banner-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Footnote */
.login-foot {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-muted);
  text-align: center;
}

.login-foot__link {
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: none;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.login-foot__link:hover {
  opacity: 0.75;
}

/* Back to home */
.login-back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-muted);
  text-decoration: none;
  align-self: center;
  transition: color var(--duration-fast) var(--ease-out);
}

.login-back:hover {
  color: var(--color-ink);
}

/* ── Keyframes ─────────────────────────────────────────────── */

@keyframes brand-enter {
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes dot-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.40; transform: scale(0.78); }
}

/* ── Reduced motion ────────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  .login-brand {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .lv-live__dot {
    animation: none;
  }

  .lf-input,
  .lf-submit,
  .lf-forgot,
  .login-back,
  .login-foot__link {
    transition: none;
  }
}

/* ── Responsive ────────────────────────────────────────────── */

@media (max-width: 900px) {
  .login-brand {
    width: 38%;
  }

  .login-brand__inner {
    padding: 2rem;
    gap: var(--space-8);
  }

  .login-brand__headline {
    font-size: clamp(1.5rem, 2.6vw, 2.25rem);
  }
}

@media (max-width: 700px) {
  .login-root {
    flex-direction: column;
  }

  .login-brand {
    display: none;
  }

  .login-mobile-logo {
    display: flex;
    align-items: center;
  }

  .login-main {
    align-items: flex-start;
    padding: var(--space-8) var(--space-6);
    min-height: 100dvh;
  }

  .login-form-wrap {
    padding-top: var(--space-4);
    max-width: 100%;
    gap: var(--space-5);
  }
}
</style>
