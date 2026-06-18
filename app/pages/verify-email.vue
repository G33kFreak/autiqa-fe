<script setup lang="ts">
import { FetchError } from 'ofetch'
import { StatusCodes } from 'http-status-codes'

definePageMeta({ layout: false })

const { t } = useI18n()
const localePath = useLocalePath()
const authStore = useAuthStore()

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 30

/* ── State ────────────────────────────────────────────────── */
const digits = ref<string[]>(Array.from({ length: OTP_LENGTH }, () => ''))
const inputs = ref<(HTMLInputElement | null)[]>([])
const pending = ref(false)
const formError = ref('')
const resendNote = ref('')
const resending = ref(false)
const cooldown = ref(0)

let cooldownTimer: ReturnType<typeof setInterval> | null = null

const code = computed(() => digits.value.join(''))
const complete = computed(() => digits.value.every((d) => d.length === 1))

/** `jan.kowalski@company.com` → `ja···@company.com`. */
const maskedEmail = computed(() => {
  const email = authStore.user?.email
  if (!email) return ''
  const at = email.indexOf('@')
  if (at <= 0) return email
  const local = email.slice(0, at)
  const domain = email.slice(at + 1)
  const head = local.slice(0, Math.min(2, local.length))
  return `${head}···@${domain}`
})

/* ── OTP input behaviour ──────────────────────────────────── */
function setInputRef(el: unknown, i: number) {
  inputs.value[i] = (el as HTMLInputElement | null) ?? null
}

function focusInput(i: number) {
  nextTick(() => inputs.value[i]?.focus())
}

function onInput(i: number, raw: string) {
  formError.value = ''
  const digit = raw.replace(/\D/g, '').slice(-1)
  digits.value[i] = digit

  if (digit && i < OTP_LENGTH - 1) focusInput(i + 1)
  if (digit && complete.value) submit()
}

function onKeydown(e: KeyboardEvent, i: number) {
  if (e.key === 'Backspace' && !digits.value[i] && i > 0) {
    e.preventDefault()
    digits.value[i - 1] = ''
    focusInput(i - 1)
  } else if (e.key === 'ArrowLeft' && i > 0) {
    e.preventDefault()
    focusInput(i - 1)
  } else if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) {
    e.preventDefault()
    focusInput(i + 1)
  }
}

function onPaste(e: ClipboardEvent, start: number) {
  e.preventDefault()
  const pasted = (e.clipboardData?.getData('text') ?? '')
    .replace(/\D/g, '')
    .slice(0, OTP_LENGTH - start)
    .split('')
  if (!pasted.length) return

  formError.value = ''
  const next = [...digits.value]
  pasted.forEach((d, k) => (next[start + k] = d))
  digits.value = next

  const landing = Math.min(start + pasted.length, OTP_LENGTH - 1)
  focusInput(landing)
  if (complete.value) submit()
}

function reset() {
  digits.value = Array.from({ length: OTP_LENGTH }, () => '')
  focusInput(0)
}

/* ── Submit ───────────────────────────────────────────────── */
async function submit() {
  if (pending.value || !complete.value) return
  pending.value = true
  formError.value = ''
  resendNote.value = ''

  try {
    await authStore.verifyEmail(code.value)
    await navigateTo(localePath('/app'), { replace: true })
  } catch (e: unknown) {
    const status = e instanceof FetchError ? (e.status ?? e.statusCode) : 0
    formError.value =
      status === StatusCodes.BAD_REQUEST || status === StatusCodes.UNAUTHORIZED
        ? t('verifyEmail.errors.invalidCode')
        : t('verifyEmail.errors.generic')
    reset()
  } finally {
    pending.value = false
  }
}

/* ── Resend ───────────────────────────────────────────────── */
function startCooldown(seconds: number) {
  cooldown.value = seconds
  if (cooldownTimer) clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    cooldown.value -= 1
    if (cooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

async function resend() {
  if (resending.value || cooldown.value > 0) return
  resending.value = true
  formError.value = ''
  resendNote.value = ''

  try {
    await authStore.resendVerification()
    resendNote.value = t('verifyEmail.resendDone')
    startCooldown(RESEND_COOLDOWN)
    reset()
  } catch {
    formError.value = t('verifyEmail.errors.resendFailed')
  } finally {
    resending.value = false
  }
}

async function useDifferentEmail() {
  await authStore.logout()
}

/* ── Lifecycle ────────────────────────────────────────────── */
onMounted(() => {
  focusInput(0)
  // A code was just sent during registration — open with the cooldown running.
  startCooldown(RESEND_COOLDOWN)
})

onBeforeUnmount(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})

useSeoMeta({
  title: () => t('verifyEmail.metaTitle'),
  description: () => t('verifyEmail.metaDescription'),
})
</script>

<template>
  <main class="vf-root">
    <section class="vf-card">

      <NuxtLink :to="localePath('/')" class="vf-logo" :aria-label="$t('verifyEmail.backToHome')">
        <AutiqaLogo :size="28" />
      </NuxtLink>

      <header class="vf-head">
        <span class="vf-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" stroke-width="1.6" />
            <path d="M4 7.5L11.05 12.3C11.63 12.69 12.37 12.69 12.95 12.3L20 7.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </span>
        <h1 class="vf-title">{{ $t('verifyEmail.title') }}</h1>
        <p class="vf-subtitle">
          <i18n-t keypath="verifyEmail.subtitle" scope="global">
            <template #email><strong class="vf-email">{{ maskedEmail }}</strong></template>
          </i18n-t>
        </p>
      </header>

      <form class="vf-form" novalidate :aria-busy="pending" @submit.prevent="submit">

        <transition name="vf-fade">
          <div v-if="formError" class="vf-banner vf-banner--error" role="alert">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4" />
              <line x1="8" y1="4.75" x2="8" y2="8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              <circle cx="8" cy="11" r="0.7" fill="currentColor" />
            </svg>
            <span>{{ formError }}</span>
          </div>
        </transition>

        <fieldset class="vf-otp" :disabled="pending">
          <legend class="sr-only">{{ $t('verifyEmail.otpAria') }}</legend>
          <template v-for="i in OTP_LENGTH" :key="i">
            <span v-if="i === 4" class="vf-otp__sep" aria-hidden="true" />
            <input
              :ref="(el) => setInputRef(el, i - 1)"
              class="vf-otp__digit"
              :class="{ 'is-filled': digits[i - 1] }"
              type="text"
              inputmode="numeric"
              maxlength="1"
              :autocomplete="i === 1 ? 'one-time-code' : 'off'"
              :value="digits[i - 1]"
              :aria-label="$t('verifyEmail.digitAria', { n: i })"
              @input="onInput(i - 1, ($event.target as HTMLInputElement).value)"
              @keydown="onKeydown($event, i - 1)"
              @paste="onPaste($event, i - 1)"
              @focus="($event.target as HTMLInputElement).select()"
            >
          </template>
        </fieldset>

        <button type="submit" class="vf-submit" :disabled="!complete || pending">
          <span v-if="!pending">{{ $t('verifyEmail.submit') }}</span>
          <span v-else class="vf-spinner" aria-hidden="true" />
          <span v-if="pending" class="sr-only">{{ $t('verifyEmail.submitPending') }}</span>
        </button>

      </form>

      <p class="vf-resend">
        <span>{{ $t('verifyEmail.resendLead') }}</span>
        <span v-if="cooldown > 0" class="vf-resend__wait" aria-live="off">
          {{ $t('verifyEmail.resendIn', { n: cooldown }) }}
        </span>
        <button
          v-else
          type="button"
          class="vf-link"
          :disabled="resending"
          @click="resend"
        >
          {{ resending ? $t('verifyEmail.resending') : $t('verifyEmail.resendAction') }}
        </button>
      </p>

      <transition name="vf-fade">
        <p v-if="resendNote" class="vf-note" role="status">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ resendNote }}
        </p>
      </transition>

      <button type="button" class="vf-different" @click="useDifferentEmail">
        {{ $t('verifyEmail.useDifferentEmail') }}
      </button>

    </section>
  </main>
</template>

<style scoped>
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

/* ── Page ──────────────────────────────────────────────────── */
.vf-root {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: var(--space-8) var(--space-6);
}

.vf-card {
  width: 100%;
  max-width: 25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-5);
  animation: vf-rise 0.5s var(--ease-out) both;
}

.vf-logo {
  display: inline-flex;
  align-items: center;
}

/* ── Header ────────────────────────────────────────────────── */
.vf-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.vf-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-lg);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}

.vf-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.625rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.15;
  color: var(--color-ink);
  text-wrap: balance;
}

.vf-subtitle {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--color-muted);
  max-width: 32ch;
  text-wrap: pretty;
}

.vf-email {
  font-weight: 600;
  color: var(--color-ink);
  white-space: nowrap;
}

/* ── Form ──────────────────────────────────────────────────── */
.vf-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
}

/* OTP inputs */
.vf-otp {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  border: 0;
  width: 100%;
}

.vf-otp__sep {
  width: 0.625rem;
  height: 1.5px;
  border-radius: var(--radius-full);
  background: var(--color-outline);
  flex-shrink: 0;
}

.vf-otp__digit {
  width: 100%;
  min-width: 0;
  aspect-ratio: 4 / 5;
  max-width: 3rem;
  padding: 0;
  text-align: center;
  background: var(--color-surface);
  border: 1.5px solid var(--color-outline);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 1.375rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
  line-height: 1;
  outline: none;
  appearance: none;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.vf-otp__digit.is-filled {
  border-color: oklch(0.680 0.012 268);
  background: var(--color-bg);
}

.vf-otp__digit:focus {
  border-color: var(--color-primary);
  background: var(--color-bg);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

.vf-otp:disabled .vf-otp__digit {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Submit */
.vf-submit {
  position: relative;
  width: 100%;
  min-height: 2.625rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1.5rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.2;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
}

.vf-submit:hover:not(:disabled) {
  background: var(--color-primary-hover);
  box-shadow: 0 4px 16px var(--color-primary-subtle);
}

.vf-submit:active:not(:disabled) {
  transform: scale(0.985);
}

.vf-submit:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

.vf-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vf-spinner {
  width: 1.125rem;
  height: 1.125rem;
  border: 2px solid oklch(1 0 0 / 0.35);
  border-top-color: var(--color-on-primary);
  border-radius: 50%;
  animation: vf-spin 0.7s linear infinite;
}

/* ── Error banner ──────────────────────────────────────────── */
.vf-banner {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0.625rem 0.875rem;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.4;
  text-align: left;
}

.vf-banner--error {
  background: var(--color-risk-bg);
  border: 1px solid oklch(0.420 0.180 26 / 0.22);
  color: var(--color-risk);
}

.vf-banner svg {
  flex-shrink: 0;
}

/* ── Resend ────────────────────────────────────────────────── */
.vf-resend {
  margin: 0;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4ch;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.vf-resend__wait {
  font-weight: 500;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
}

.vf-link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-weight: 600;
  color: var(--color-primary);
  transition: opacity var(--duration-fast) var(--ease-out);
}

.vf-link:hover:not(:disabled) {
  opacity: 0.75;
}

.vf-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.vf-link:disabled {
  color: var(--color-muted);
  cursor: progress;
}

/* Sent confirmation */
.vf-note {
  margin: calc(var(--space-3) * -1) 0 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-comply);
}

/* Different email escape hatch */
.vf-different {
  margin-top: var(--space-1);
  background: none;
  border: none;
  padding: var(--space-2);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-muted);
  transition: color var(--duration-fast) var(--ease-out);
}

.vf-different:hover {
  color: var(--color-ink);
}

.vf-different:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* ── Transitions ───────────────────────────────────────────── */
.vf-fade-enter-active,
.vf-fade-leave-active {
  transition:
    opacity var(--duration-ui) var(--ease-out),
    transform var(--duration-ui) var(--ease-out);
}

.vf-fade-enter-from,
.vf-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes vf-rise {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes vf-spin {
  to { transform: rotate(360deg); }
}

/* ── Reduced motion ────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .vf-card {
    animation: none;
  }

  .vf-otp__digit,
  .vf-submit,
  .vf-link,
  .vf-different {
    transition: none;
  }

  .vf-spinner {
    animation-duration: 1.4s;
  }

  .vf-fade-enter-active,
  .vf-fade-leave-active {
    transition: opacity var(--duration-fast) var(--ease-out);
  }

  .vf-fade-enter-from,
  .vf-fade-leave-to {
    transform: none;
  }
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 420px) {
  .vf-otp {
    gap: 6px;
  }

  .vf-otp__sep {
    width: 0.375rem;
  }
}
</style>
