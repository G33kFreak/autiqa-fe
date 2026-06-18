<script setup lang="ts">
definePageMeta({ layout: false })

const { t } = useI18n()
const localePath = useLocalePath()

/* ── Form state ──────────────────────────────────────────────
 * UI only for now. `submit()` runs the same client-side validation
 * the real flow will use; wiring the API later is a single call:
 *   await authStore.register({ name, email, password })
 * The server contract is { name, email, password }.
 * ----------------------------------------------------------- */
const name = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const showPassword = ref(false)
const pending = ref(false)
const formError = ref('')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* Password strength: 0 (empty) … 4 (strong). */
const strengthScore = computed(() => {
  const p = password.value
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s++
  if (p.length >= 12) s++
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++
  if (/\d/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return Math.max(1, Math.min(s, 4))
})

const strengthLabel = computed(() => {
  const keys = ['', 'weak', 'fair', 'good', 'strong'] as const
  const k = keys[strengthScore.value]
  return k ? t(`register.strength.${k}`) : ''
})

const passwordsMatch = computed(
  () => confirm.value.length > 0 && password.value === confirm.value,
)

function validate(): boolean {
  formError.value = ''
  const n = name.value.trim()
  const e = email.value.trim()
  const p = password.value
  const c = confirm.value

  if (!n) return fail('nameRequired')
  if (!e) return fail('emailRequired')
  if (!EMAIL_RE.test(e)) return fail('emailInvalid')
  if (p.length < 8) return fail('passwordShort')
  if (p !== c) return fail('passwordMismatch')
  return true
}

function fail(key: string): false {
  formError.value = t(`register.errors.${key}`)
  return false
}

async function submit() {
  if (pending.value) return
  if (!validate()) return

  // UI-only demo of the pending state. Replace with authStore.register(…).
  pending.value = true
  await new Promise((r) => setTimeout(r, 900))
  pending.value = false
}
</script>

<template>
  <div class="reg-root">

    <!-- ── Form panel (left) ────────────────────────────────── -->
    <main class="reg-main">
      <div class="reg-form-wrap">

        <div class="reg-mobile-logo">
          <AutiqaLogo :size="26" />
        </div>

        <header class="reg-head">
          <h1 class="reg-title">{{ $t('register.title') }}</h1>
          <p class="reg-subtitle">{{ $t('register.subtitle') }}</p>
        </header>

        <form class="reg-form" novalidate :aria-busy="pending" @submit.prevent="submit">

          <transition name="reg-banner">
            <div v-if="formError" class="reg-banner" role="alert">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4" />
                <line x1="8" y1="4.75" x2="8" y2="8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                <circle cx="8" cy="11" r="0.7" fill="currentColor" />
              </svg>
              <span>{{ formError }}</span>
            </div>
          </transition>

          <div class="reg-fields">

            <!-- Name -->
            <div class="reg-field">
              <label class="reg-label" for="r-name">{{ $t('register.nameLabel') }}</label>
              <input
                id="r-name"
                v-model="name"
                type="text"
                name="name"
                class="reg-input"
                autocomplete="name"
                :disabled="pending"
                :placeholder="$t('register.namePlaceholder')"
              >
            </div>

            <!-- Email -->
            <div class="reg-field">
              <label class="reg-label" for="r-email">{{ $t('register.emailLabel') }}</label>
              <input
                id="r-email"
                v-model="email"
                type="email"
                name="email"
                class="reg-input"
                autocomplete="email"
                inputmode="email"
                :disabled="pending"
                :placeholder="$t('register.emailPlaceholder')"
              >
            </div>

            <!-- Password -->
            <div class="reg-field">
              <label class="reg-label" for="r-password">{{ $t('register.passwordLabel') }}</label>
              <div class="reg-input-wrap">
                <input
                  id="r-password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  name="password"
                  class="reg-input reg-input--toggle"
                  autocomplete="new-password"
                  :disabled="pending"
                  :placeholder="$t('register.passwordPlaceholder')"
                >
                <button
                  type="button"
                  class="reg-toggle"
                  :aria-label="showPassword ? $t('register.passwordHide') : $t('register.passwordShow')"
                  :aria-pressed="showPassword"
                  :disabled="pending"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M2 10C3.4 6.5 6.4 4.5 10 4.5C13.6 4.5 16.6 6.5 18 10C16.6 13.5 13.6 15.5 10 15.5C6.4 15.5 3.4 13.5 2 10Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
                    <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.4" />
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M2 10C3.4 6.5 6.4 4.5 10 4.5C13.6 4.5 16.6 6.5 18 10C16.6 13.5 13.6 15.5 10 15.5C6.4 15.5 3.4 13.5 2 10Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
                    <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.4" />
                    <line x1="3.5" y1="3" x2="16.5" y2="17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                  </svg>
                </button>
              </div>

              <!-- Strength meter -->
              <div v-if="password" class="reg-strength" :class="`reg-strength--${strengthScore}`">
                <div class="reg-strength__bars" aria-hidden="true">
                  <span v-for="i in 4" :key="i" :class="{ 'is-on': i <= strengthScore }" />
                </div>
                <span class="reg-strength__label" role="status">
                  {{ $t('register.strength.label') }} · {{ strengthLabel }}
                </span>
              </div>
            </div>

            <!-- Confirm -->
            <div class="reg-field">
              <label class="reg-label" for="r-confirm">{{ $t('register.confirmLabel') }}</label>
              <input
                id="r-confirm"
                v-model="confirm"
                :type="showPassword ? 'text' : 'password'"
                name="confirm-password"
                class="reg-input"
                autocomplete="new-password"
                :disabled="pending"
                :placeholder="$t('register.confirmPlaceholder')"
              >
              <transition name="reg-match">
                <span v-if="passwordsMatch" class="reg-match" role="status">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  {{ $t('register.passwordsMatch') }}
                </span>
              </transition>
            </div>

          </div>

          <button type="submit" class="reg-submit" :disabled="pending">
            <span v-if="!pending">{{ $t('register.submit') }}</span>
            <span v-else class="reg-spinner" aria-hidden="true" />
            <span v-if="pending" class="sr-only">{{ $t('register.submit') }}</span>
          </button>

          <p class="reg-accept">
            <i18n-t keypath="register.acceptTerms" scope="global">
              <template #terms>
                <NuxtLink :to="localePath('/terms')" class="reg-accept__link">{{ $t('register.termsLink') }}</NuxtLink>
              </template>
              <template #privacy>
                <NuxtLink :to="localePath('/privacy')" class="reg-accept__link">{{ $t('register.privacyLink') }}</NuxtLink>
              </template>
            </i18n-t>
          </p>

        </form>

        <p class="reg-foot">
          {{ $t('register.footerLead') }}
          <NuxtLink :to="localePath('/login')" class="reg-foot__link">{{ $t('register.signIn') }}</NuxtLink>
        </p>

        <NuxtLink :to="localePath('/')" class="reg-back">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 2.5L4 7L9 11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ $t('register.backToHome') }}
        </NuxtLink>

      </div>
    </main>

    <!-- ── Brand panel (right) ──────────────────────────────── -->
    <aside class="reg-brand" aria-hidden="true">
      <div class="reg-brand__glow" />
      <div class="reg-brand__inner">

        <NuxtLink :to="localePath('/')" class="reg-brand__logo">
          <AutiqaLogo :light="true" :size="30" />
        </NuxtLink>

        <div class="reg-brand__content">
          <h2 class="reg-brand__headline">{{ $t('register.brandHeadline') }}</h2>
          <p class="reg-brand__lede">{{ $t('register.brandLede') }}</p>

          <ul class="reg-props">
            <li v-for="key in ['fleet', 'compliance', 'finance']" :key="key" class="reg-prop">
              <span class="reg-prop__tick">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              {{ $t(`register.valueProps.${key}`) }}
            </li>
          </ul>
        </div>

        <!-- Product glimpse: real compliance vocabulary, not a vanity metric -->
        <div class="reg-glimpse">
          <span class="reg-glimpse__title">{{ $t('features.compliance.title') }}</span>
          <div class="reg-glimpse__rows">
            <div class="reg-grow">
              <span class="reg-grow__icon reg-grow__icon--warn">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 1.5L12.5 11.5H1.5L7 1.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                  <line x1="7" y1="5.5" x2="7" y2="8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  <circle cx="7" cy="10.5" r="0.7" fill="currentColor" />
                </svg>
              </span>
              <div class="reg-grow__body">
                <span class="reg-grow__title">{{ $t('featureCompliance.inspection') }}</span>
                <span class="reg-grow__sub">WI 12345 · Toyota Camry</span>
              </div>
              <span class="reg-grow__days reg-grow__days--warn">{{ $t('featureCompliance.daysLeft', { n: 3 }) }}</span>
            </div>
            <div class="reg-grow">
              <span class="reg-grow__icon reg-grow__icon--ok">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <div class="reg-grow__body">
                <span class="reg-grow__title">{{ $t('featureCompliance.insurance') }}</span>
                <span class="reg-grow__sub">KR 98765 · Honda Accord</span>
              </div>
              <span class="reg-grow__days reg-grow__days--ok">{{ $t('featureCompliance.daysLeft', { n: 21 }) }}</span>
            </div>
          </div>
        </div>

      </div>
    </aside>

  </div>
</template>

<style scoped>
/* ── Root ──────────────────────────────────────────────────── */

.reg-root {
  height: 100dvh;
  display: flex;
  overflow: hidden;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

/* ── Form panel (left) ─────────────────────────────────────── */

.reg-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: var(--space-8);
  overflow-y: auto;
}

.reg-form-wrap {
  width: 100%;
  max-width: 23rem;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.reg-mobile-logo {
  display: none;
}

.reg-head {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.reg-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.625rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.15;
  color: var(--color-ink);
}

.reg-subtitle {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 400;
  line-height: 1.55;
  color: var(--color-muted);
  max-width: 34ch;
  text-wrap: pretty;
}

/* ── Form ──────────────────────────────────────────────────── */

.reg-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.reg-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.reg-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reg-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-ink);
  line-height: 1;
}

.reg-input {
  width: 100%;
  padding: 0.5rem 0.875rem;
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

.reg-input--toggle {
  padding-right: 2.75rem;
}

.reg-input::placeholder {
  color: var(--color-muted);
  opacity: 0.55;
}

.reg-input:hover:not(:disabled) {
  border-color: oklch(0.680 0.012 268);
}

.reg-input:focus {
  border-color: var(--color-primary);
  background: var(--color-bg);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

.reg-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Password input + toggle */
.reg-input-wrap {
  position: relative;
}

.reg-toggle {
  position: absolute;
  top: 50%;
  right: 0.375rem;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  color: var(--color-muted);
  transition:
    color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.reg-toggle:hover:not(:disabled) {
  color: var(--color-ink);
  background: var(--color-surface-mid);
}

.reg-toggle:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
  color: var(--color-ink);
}

.reg-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Strength meter ────────────────────────────────────────── */

.reg-strength {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-1);
}

.reg-strength__bars {
  display: flex;
  gap: 4px;
  flex: 1;
  max-width: 9rem;
}

.reg-strength__bars span {
  height: 4px;
  flex: 1;
  border-radius: var(--radius-full);
  background: var(--color-surface-high);
  transition:
    background-color var(--duration-ui) var(--ease-out),
    transform var(--duration-ui) var(--ease-out);
  transform-origin: left center;
}

.reg-strength__bars span.is-on {
  background: var(--_str, var(--color-muted));
}

.reg-strength__label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--_str, var(--color-muted));
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.reg-strength--1 { --_str: var(--color-risk); }
.reg-strength--2 { --_str: var(--color-warn); }
.reg-strength--3 { --_str: oklch(0.500 0.130 200); }
.reg-strength--4 { --_str: var(--color-comply); }

/* ── Match indicator ───────────────────────────────────────── */

.reg-match {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: var(--space-1);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-comply);
}

/* ── Submit ────────────────────────────────────────────────── */

.reg-submit {
  position: relative;
  width: 100%;
  min-height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5625rem 1.5rem;
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

.reg-submit:hover:not(:disabled) {
  background: var(--color-primary-hover);
  box-shadow: 0 4px 16px var(--color-primary-subtle);
}

.reg-submit:active {
  transform: scale(0.985);
}

.reg-submit:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

.reg-submit:disabled {
  cursor: progress;
  opacity: 0.9;
}

.reg-spinner {
  width: 1.125rem;
  height: 1.125rem;
  border: 2px solid oklch(1 0 0 / 0.35);
  border-top-color: var(--color-on-primary);
  border-radius: 50%;
  animation: reg-spin 0.7s linear infinite;
}

/* ── Accept note (below button) ────────────────────────────── */

.reg-accept {
  margin: 0;
  font-size: 0.6875rem;
  line-height: 1.5;
  color: oklch(0.560 0.010 268);
  text-align: center;
}

.reg-accept__link {
  color: oklch(0.560 0.010 268);
  text-decoration: underline;
  text-decoration-color: var(--color-outline);
  text-underline-offset: 2px;
  transition:
    color var(--duration-fast) var(--ease-out),
    text-decoration-color var(--duration-fast) var(--ease-out);
}

.reg-accept__link:hover {
  color: var(--color-ink);
  text-decoration-color: var(--color-ink);
}

/* ── Footnote ──────────────────────────────────────────────── */

.reg-foot {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-muted);
  text-align: center;
}

.reg-foot__link {
  color: var(--color-primary);
  font-weight: 500;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.reg-foot__link:hover {
  opacity: 0.75;
}

/* ── Banner ────────────────────────────────────────────────── */

.reg-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: 0.625rem 0.875rem;
  background: var(--color-risk-bg);
  border: 1px solid oklch(0.420 0.180 26 / 0.22);
  border-radius: var(--radius-md);
  color: var(--color-risk);
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.4;
}

.reg-banner svg {
  flex-shrink: 0;
  margin-top: 1px;
}

/* ── Back link ─────────────────────────────────────────────── */

.reg-back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-muted);
  align-self: center;
  transition: color var(--duration-fast) var(--ease-out);
}

.reg-back:hover {
  color: var(--color-ink);
}

/* ── Brand panel (right) ───────────────────────────────────── */

.reg-brand {
  position: relative;
  width: 44%;
  flex-shrink: 0;
  background: var(--color-hero-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: reg-brand-enter 0.55s var(--ease-out) forwards;
}

.reg-brand__glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 55% at 70% 18%, oklch(0.52 0.14 268 / 0.45) 0%, transparent 70%),
    radial-gradient(ellipse 50% 40% at 22% 88%, oklch(0.28 0.20 268 / 0.35) 0%, transparent 65%);
  pointer-events: none;
}

.reg-brand__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2.5rem;
  gap: var(--space-10);
}

.reg-brand__logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.reg-brand__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.reg-brand__headline {
  margin: 0 0 var(--space-4);
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 2.8vw, 2.75rem);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.05;
  color: var(--color-hero-ink);
  text-wrap: balance;
}

.reg-brand__lede {
  margin: 0 0 var(--space-8);
  font-size: 0.9375rem;
  font-weight: 300;
  line-height: 1.65;
  color: var(--color-hero-muted);
  max-width: 38ch;
  text-wrap: pretty;
}

/* Value props */
.reg-props {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.reg-prop {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: 0.9375rem;
  font-weight: 400;
  color: var(--color-hero-ink);
}

.reg-prop__tick {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.375rem;
  height: 1.375rem;
  border-radius: var(--radius-full);
  background: oklch(0.440 0.140 158 / 0.20);
  color: oklch(0.760 0.150 158);
}

/* Product glimpse */
.reg-glimpse {
  --g-outline: oklch(0.155 0.018 268 / 0.09);

  flex-shrink: 0;
  padding: var(--space-4) var(--space-5);
  background: oklch(0.982 0.005 268);
  border: 1px solid var(--g-outline);
  border-radius: var(--radius-lg);
  box-shadow:
    0 20px 60px oklch(0.08 0.015 268 / 0.50),
    0 4px 16px oklch(0.08 0.015 268 / 0.22);
}

.reg-glimpse__title {
  display: block;
  margin-bottom: var(--space-3);
  font-size: 0.5625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: oklch(0.455 0.014 268);
}

.reg-glimpse__rows {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.reg-grow {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.reg-grow__icon {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.reg-grow__icon--warn {
  background: oklch(0.420 0.180 26 / 0.16);
  color: oklch(0.420 0.180 26);
}

.reg-grow__icon--ok {
  background: oklch(0.440 0.140 158 / 0.16);
  color: oklch(0.440 0.140 158);
}

.reg-grow__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.reg-grow__title {
  font-size: 0.75rem;
  font-weight: 600;
  color: oklch(0.155 0.018 268);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reg-grow__sub {
  font-size: 0.625rem;
  color: oklch(0.455 0.014 268);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.reg-grow__days {
  flex-shrink: 0;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.25em 0.65em;
  border-radius: var(--radius-full);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.reg-grow__days--warn {
  background: oklch(0.420 0.180 26 / 0.16);
  color: oklch(0.420 0.180 26);
}

.reg-grow__days--ok {
  background: oklch(0.440 0.140 158 / 0.16);
  color: oklch(0.440 0.140 158);
}

/* ── Entrance / transitions ────────────────────────────────── */

.reg-head,
.reg-field,
.reg-submit,
.reg-accept,
.reg-foot {
  animation: reg-rise 0.5s var(--ease-out) both;
}

.reg-head { animation-delay: 0.04s; }
.reg-fields .reg-field:nth-child(1) { animation-delay: 0.10s; }
.reg-fields .reg-field:nth-child(2) { animation-delay: 0.16s; }
.reg-fields .reg-field:nth-child(3) { animation-delay: 0.22s; }
.reg-fields .reg-field:nth-child(4) { animation-delay: 0.28s; }
.reg-submit  { animation-delay: 0.34s; }
.reg-accept  { animation-delay: 0.38s; }
.reg-foot    { animation-delay: 0.42s; }

.reg-banner-enter-active,
.reg-banner-leave-active,
.reg-match-enter-active,
.reg-match-leave-active {
  transition:
    opacity var(--duration-ui) var(--ease-out),
    transform var(--duration-ui) var(--ease-out);
}

.reg-banner-enter-from,
.reg-banner-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.reg-match-enter-from,
.reg-match-leave-to {
  opacity: 0;
  transform: translateY(2px);
}

/* ── Keyframes ─────────────────────────────────────────────── */

@keyframes reg-brand-enter {
  from { opacity: 0; transform: translateX(16px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes reg-rise {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes reg-spin {
  to { transform: rotate(360deg); }
}

/* ── Reduced motion ────────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  .reg-brand,
  .reg-head,
  .reg-field,
  .reg-submit,
  .reg-accept,
  .reg-foot {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .reg-input,
  .reg-toggle,
  .reg-submit,
  .reg-foot__link,
  .reg-accept__link,
  .reg-back,
  .reg-strength__bars span {
    transition: none;
  }

  .reg-spinner {
    animation-duration: 1.4s;
  }

  .reg-banner-enter-active,
  .reg-banner-leave-active,
  .reg-match-enter-active,
  .reg-match-leave-active {
    transition: opacity var(--duration-fast) var(--ease-out);
  }

  .reg-banner-enter-from,
  .reg-banner-leave-to,
  .reg-match-enter-from,
  .reg-match-leave-to {
    transform: none;
  }
}

/* ── Responsive ────────────────────────────────────────────── */

@media (max-width: 900px) {
  .reg-brand {
    width: 38%;
  }

  .reg-brand__inner {
    padding: 2rem;
    gap: var(--space-8);
  }

  .reg-brand__headline {
    font-size: clamp(1.5rem, 2.6vw, 2.25rem);
  }
}

@media (max-width: 700px) {
  .reg-root {
    flex-direction: column;
  }

  .reg-brand {
    display: none;
  }

  .reg-mobile-logo {
    display: flex;
    align-items: center;
  }

  .reg-main {
    align-items: flex-start;
    padding: var(--space-8) var(--space-6);
  }

  .reg-form-wrap {
    padding-top: var(--space-4);
    max-width: 100%;
  }
}
</style>
