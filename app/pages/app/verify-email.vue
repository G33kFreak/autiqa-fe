<script setup lang="ts">
import { FetchError } from 'ofetch';
import { StatusCodes } from 'http-status-codes';

/**
 * Fullscreen email verification — 6-digit OTP; submits to `POST /auth/verify-email`.
 * Intended when `user.isActive === false` until email is confirmed.
 */
definePageMeta({
  i18n: false,
});

const { t } = useI18n();
const authStore = useAuthStore();

const digits = ref(['', '', '', '', '', '']);
const otpRefs = ref<(HTMLInputElement | null)[]>([]);
const pending = ref(false);
const submitError = ref('');

function setOtpRef(el: unknown, i: number) {
  otpRefs.value[i] = (el as HTMLInputElement | null) ?? null;
}

const codeComplete = computed(() => digits.value.every((d) => d.length === 1));

const displayEmail = computed(() => {
  const email = authStore.user?.email;
  if (!email) return t('verifyEmail.emailUnknown');
  const at = email.indexOf('@');
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (local.length <= 2) return `${local}@${domain}`;
  return `${local.slice(0, 2)}${'\u2009'}·\u2009·\u2009·\u2009@${domain}`;
});

function onDigitInput(i: number, raw: string) {
  const v = raw.replace(/\D/g, '').slice(-1);
  digits.value[i] = v;
  if (v && i < 5) {
    nextTick(() => otpRefs.value[i + 1]?.focus());
  }
}

function onDigitKeydown(e: KeyboardEvent, i: number) {
  if (e.key === 'Backspace' && !digits.value[i] && i > 0) {
    otpRefs.value[i - 1]?.focus();
  }
}

function onPaste(e: ClipboardEvent, startIndex: number) {
  e.preventDefault();
  const text = e.clipboardData?.getData('text') ?? '';
  const nums = text.replace(/\D/g, '').slice(0, 6).split('');
  if (!nums.length) return;
  const next = [...digits.value];
  for (let k = 0; k < nums.length && startIndex + k < 6; k++) {
    next[startIndex + k] = nums[k]!;
  }
  digits.value = next;
  const focusAt = Math.min(startIndex + nums.length, 5);
  nextTick(() => otpRefs.value[focusAt]?.focus());
}

async function onSubmit() {
  if (!codeComplete.value || pending.value) return;
  submitError.value = '';
  pending.value = true;
  try {
    await authStore.verifyEmail(digits.value.join(''));
    await navigateTo('/app', { replace: true });
  } catch (e: unknown) {
    const status = e instanceof FetchError ? (e.status ?? e.statusCode) : 0;
    if (status === StatusCodes.BAD_REQUEST) {
      submitError.value = t('verifyEmail.errors.invalidCode');
    } else {
      submitError.value = t('verifyEmail.errors.generic');
    }
  } finally {
    pending.value = false;
  }
}

function onResend() {
  /* Wire resend OTP when backend is ready */
}

async function onLogout() {
  await authStore.logout();
}

useSeoMeta({
  title: computed(() => t('meta.verifyEmail.title')),
  description: computed(() => t('meta.verifyEmail.description')),
});

onMounted(() => {
  nextTick(() => otpRefs.value[0]?.focus());
});
</script>

<template>
  <div class="otp-screen">
    <div class="otp-screen__glow otp-screen__glow--tr" aria-hidden="true" />
    <div class="otp-screen__glow otp-screen__glow--bl" aria-hidden="true" />
    <div class="otp-screen__grid" aria-hidden="true" />

    <main class="otp-screen__main">
      <div class="otp-screen__card">
        <div class="otp-screen__accent" aria-hidden="true" />

        <header class="otp-screen__head">
          <div class="otp-screen__brand">
            <span class="otp-screen__logo">{{ t('brand') }}</span>
          </div>
          <p class="otp-screen__eyebrow">{{ t('verifyEmail.eyebrow') }}</p>
          <h1 class="otp-screen__title">{{ t('verifyEmail.title') }}</h1>
          <p class="otp-screen__lede">
            {{ t('verifyEmail.subtitle', { email: displayEmail }) }}
          </p>
        </header>

        <form
          class="otp-screen__form"
          :aria-busy="pending"
          @submit.prevent="onSubmit"
        >
          <p v-if="submitError" class="otp-screen__error" role="alert">
            {{ submitError }}
          </p>
          <span class="otp-screen__field-label">{{ t('verifyEmail.otpLabel') }}</span>
          <div
            class="otp-screen__otp"
            role="group"
            :aria-label="t('verifyEmail.otpAria')"
          >
            <input
              v-for="i in [0, 1, 2, 3, 4, 5]"
              :key="i"
              :ref="(el) => setOtpRef(el, i)"
              class="otp-screen__digit"
              type="text"
              inputmode="numeric"
              maxlength="1"
              autocomplete="one-time-code"
              :value="digits[i]"
              :aria-label="t('verifyEmail.digitAria', { n: i + 1 })"
              :disabled="pending"
              @input="onDigitInput(i, ($event.target as HTMLInputElement).value)"
              @keydown="onDigitKeydown($event, i)"
              @paste="onPaste($event, i)"
            >
          </div>

          <button
            type="submit"
            class="otp-screen__cta"
            :disabled="!codeComplete || pending"
            :aria-disabled="!codeComplete || pending"
          >
            {{ t('verifyEmail.submit') }}
          </button>
        </form>

        <p class="otp-screen__resend">
          <span>{{ t('verifyEmail.resendLead') }}</span>
          <button type="button" class="otp-screen__text-btn" @click="onResend">
            {{ t('verifyEmail.resendAction') }}
          </button>
        </p>

        <p class="otp-screen__signout">
          <button type="button" class="otp-screen__text-btn" @click="onLogout">
            {{ t('verifyEmail.logout') }}
          </button>
        </p>
      </div>

      <p class="otp-screen__hint">{{ t('verifyEmail.footerHint') }}</p>
    </main>
  </div>
</template>

<style scoped>
.otp-screen {
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 4vw, 2.5rem);
  background: var(--color-surface);
  color: var(--color-on-surface);
  overflow: hidden;
}

.otp-screen__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  opacity: 0.55;
}

.otp-screen__glow--tr {
  width: min(72vw, 520px);
  height: min(72vw, 520px);
  top: -18%;
  right: -12%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--color-secondary) 22%, transparent) 0%,
    transparent 70%
  );
}

.otp-screen__glow--bl {
  width: min(60vw, 420px);
  height: min(60vw, 420px);
  bottom: -14%;
  left: -8%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--color-secondary-container) 18%, transparent) 0%,
    transparent 72%
  );
}

.otp-screen__grid {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  background-image:
    linear-gradient(var(--color-on-surface) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-on-surface) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 45%, black 20%, transparent 100%);
}

.otp-screen__main {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 28rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1.25rem;
}

.otp-screen__card {
  position: relative;
  padding: clamp(1.75rem, 5vw, 2.5rem);
  border-radius: 1.25rem;
  background: var(--color-surface-container-low);
  box-shadow: var(--shadow-ambient);
}

.otp-screen__accent {
  position: absolute;
  left: 0;
  top: 1.5rem;
  bottom: 1.5rem;
  width: 4px;
  border-radius: 0 4px 4px 0;
  background: linear-gradient(
    180deg,
    var(--color-secondary),
    var(--color-secondary-container)
  );
}

.otp-screen__head {
  padding-left: 0.75rem;
  margin-bottom: 1.75rem;
}

.otp-screen__brand {
  margin-bottom: 1rem;
}

.otp-screen__logo {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-on-surface);
}

.otp-screen__eyebrow {
  margin: 0 0 0.5rem;
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-secondary);
}

.otp-screen__title {
  margin: 0 0 0.75rem;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4.5vw, 1.875rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: var(--color-on-surface);
}

.otp-screen__lede {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--color-on-surface-variant);
  max-width: 26rem;
}

.otp-screen__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-left: 0.75rem;
}

.otp-screen__error {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--color-on-error-container);
  background: var(--color-error-container);
}

.otp-screen__field-label {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.otp-screen__otp {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
}

.otp-screen__digit {
  width: clamp(2.5rem, 11vw, 3rem);
  height: clamp(2.75rem, 12vw, 3.25rem);
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 0.5rem;
  text-align: center;
  font-family: var(--font-display);
  font-size: clamp(1.125rem, 4vw, 1.375rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-on-surface);
  background: var(--color-surface-container-highest);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--color-on-surface) 6%, transparent);
  transition:
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.otp-screen__digit:focus {
  outline: none;
  background: var(--color-surface-container-lowest);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--color-on-surface) 5%, transparent),
    0 0 0 2px color-mix(in srgb, var(--color-secondary) 30%, transparent);
}

.otp-screen__digit::placeholder {
  color: color-mix(in srgb, var(--color-on-surface-variant) 45%, transparent);
}

.otp-screen__cta {
  margin-top: 0.25rem;
  width: 100%;
  padding: 0.875rem 1.125rem;
  border: none;
  border-radius: 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-on-secondary);
  cursor: pointer;
  background: linear-gradient(
    135deg,
    var(--color-secondary) 0%,
    var(--color-secondary-container) 100%
  );
  transition:
    opacity 0.2s ease,
    transform 0.15s ease;
}

.otp-screen__cta:hover:not(:disabled) {
  opacity: 0.94;
  transform: translateY(-1px);
}

.otp-screen__cta:disabled {
  opacity: 0.42;
  cursor: not-allowed;
  transform: none;
}

.otp-screen__cta:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 40%, transparent);
  outline-offset: 3px;
}

.otp-screen__resend,
.otp-screen__signout {
  margin: 0;
  padding-left: 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--color-on-surface-variant);
}

.otp-screen__resend {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.5rem;
  align-items: center;
}

.otp-screen__text-btn {
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-weight: 600;
  color: var(--color-secondary);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
}

.otp-screen__text-btn:hover {
  color: var(--color-secondary-container);
}

.otp-screen__hint {
  margin: 0;
  text-align: center;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  line-height: 1.45;
  color: color-mix(in srgb, var(--color-on-surface-variant) 88%, transparent);
  max-width: 22rem;
  align-self: center;
}

@media (max-width: 380px) {
  .otp-screen__otp {
    gap: 0.35rem;
  }
}
</style>
