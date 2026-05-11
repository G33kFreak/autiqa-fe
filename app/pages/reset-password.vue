<script setup lang="ts">
import { FetchError } from 'ofetch';
import { StatusCodes } from 'http-status-codes';
import {
  requestForgotPassword,
  resetPasswordWithCode,
} from '~/api/auth';
import {
  clearResetPasswordTokenFromStorage,
  readResetPasswordTokenFromStorage,
  writeResetPasswordTokenToStorage,
} from '~/utils/reset-password-token-storage';

const RECOVER_PLUS_KEYS = ['otp', 'window', 'login'] as const;
const RESEND_COOLDOWN_SEC = 60;

const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const router = useRouter();
const { nuxtApi } = useApi();

const ready = ref(false);
const resetToken = ref('');

const code = ref('');
const newPassword = ref('');
const newPasswordConfirm = ref('');

const pending = ref(false);
const formError = ref('');

const resendPending = ref(false);
const resendCooldown = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;

const pluses = computed(() =>
  RECOVER_PLUS_KEYS.map((key) => t(`resetPassword.pluses.${key}`)),
);

useSeoMeta({
  title: computed(() => t('meta.resetPassword.title')),
  description: computed(() => t('meta.resetPassword.description')),
});

function upstreamMessage(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  const m = (data as { message?: unknown }).message;
  if (typeof m === 'string') return m;
  if (Array.isArray(m) && typeof m[0] === 'string') return m[0];
  return '';
}

function mapResendError(e: unknown): string {
  if (!(e instanceof FetchError)) return t('resetPassword.errors.generic');
  const status = e.status ?? e.statusCode ?? 0;
  if (status === StatusCodes.TOO_MANY_REQUESTS)
    return t('resetPassword.errors.rateLimit');
  if (status === StatusCodes.BAD_REQUEST) {
    const raw = upstreamMessage(e.data);
    if (raw) return raw;
    return t('resetPassword.errors.generic');
  }
  return t('resetPassword.errors.generic');
}

function mapResetError(e: unknown): string {
  if (!(e instanceof FetchError)) return t('resetPassword.errors.generic');
  const status = e.status ?? e.statusCode ?? 0;
  if (status === StatusCodes.TOO_MANY_REQUESTS)
    return t('resetPassword.errors.rateLimitReset');
  if (status === StatusCodes.BAD_REQUEST) {
    const raw = upstreamMessage(e.data);
    const msg = raw.toLowerCase();
    if (msg.includes('differ'))
      return t('resetPassword.errors.samePassword');
    if (
      msg.includes('invalid') ||
      msg.includes('expired') ||
      msg.includes('reset code')
    )
      return t('resetPassword.errors.invalidCode');
    if (raw) return raw;
    return t('resetPassword.errors.badRequestReset');
  }
  return t('resetPassword.errors.generic');
}

function startResendCooldown() {
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
    cooldownTimer = null;
  }
  resendCooldown.value = RESEND_COOLDOWN_SEC;
  cooldownTimer = setInterval(() => {
    resendCooldown.value -= 1;
    if (resendCooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
      resendCooldown.value = 0;
    }
  }, 1000);
}

function applyTokenUpdate(token: string) {
  resetToken.value = token;
  writeResetPasswordTokenToStorage(token);
  void router.replace({
    path: route.path,
    query: { ...route.query, token },
  });
}

onMounted(async () => {
  const q = route.query.token;
  const fromQuery = typeof q === 'string' && q.length > 0 ? q : '';
  const fromStorage = readResetPasswordTokenFromStorage() ?? '';
  const token = fromQuery || fromStorage;
  if (!token) {
    await navigateTo(localePath('/forgot-password'));
    return;
  }
  resetToken.value = token;
  writeResetPasswordTokenToStorage(token);
  if (!fromQuery && fromStorage) {
    await router.replace({
      path: route.path,
      query: { ...route.query, token: fromStorage },
    });
  }
  startResendCooldown();
  ready.value = true;
});

onUnmounted(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
    cooldownTimer = null;
  }
});

async function resend() {
  if (resendCooldown.value > 0 || resendPending.value || !resetToken.value)
    return;
  formError.value = '';
  resendPending.value = true;
  try {
    const { resetRequestToken } = await requestForgotPassword(nuxtApi, {
      resetRequestToken: resetToken.value,
    });
    applyTokenUpdate(resetRequestToken);
    startResendCooldown();
  } catch (e: unknown) {
    formError.value = mapResendError(e);
  } finally {
    resendPending.value = false;
  }
}

function onCodeInput(e: Event) {
  const el = e.target as HTMLInputElement;
  code.value = el.value.replace(/\D/g, '').slice(0, 6);
}

async function submit() {
  formError.value = '';
  const c = code.value.trim();
  const p = newPassword.value;
  const pc = newPasswordConfirm.value;

  if (c.length !== 6) {
    formError.value = t('resetPassword.errors.codeLength');
    return;
  }
  if (p.length < 8) {
    formError.value = t('resetPassword.errors.passwordShort');
    return;
  }
  if (p !== pc) {
    formError.value = t('resetPassword.errors.passwordMismatch');
    return;
  }
  if (!resetToken.value) {
    formError.value = t('resetPassword.errors.generic');
    return;
  }

  pending.value = true;
  try {
    await resetPasswordWithCode(nuxtApi, {
      resetRequestToken: resetToken.value,
      code: c,
      newPassword: p,
    });
    clearResetPasswordTokenFromStorage();
    await navigateTo({
      path: localePath('/login'),
      query: { reset: '1' },
    });
  } catch (e: unknown) {
    formError.value = mapResetError(e);
  } finally {
    pending.value = false;
  }
}

function goForgotDifferentEmail() {
  clearResetPasswordTokenFromStorage();
  void navigateTo(localePath('/forgot-password'));
}
</script>

<template>
  <div v-if="!ready" class="recover recover--boot" aria-busy="true">
    <p class="recover__boot">{{ t('common.loading') }}</p>
  </div>

  <div v-else class="recover">
    <section class="recover__aside" aria-labelledby="recover-aside-title">
      <div class="recover__aside-inner">
        <header class="recover__brand">
          <NuxtLink class="recover__brand-link" :to="localePath('/login')">
            <span class="recover__logo">{{ t('brand') }}</span>
            <span class="recover__logo-accent" aria-hidden="true" />
          </NuxtLink>
        </header>

        <h1 id="recover-aside-title" class="recover__headline">
          {{ t('resetPassword.asideHeadline') }}
        </h1>
        <p class="recover__lede">
          {{ t('resetPassword.asideLede') }}
        </p>

        <ul class="recover__pluses">
          <li v-for="(item, i) in pluses" :key="i" class="recover__plus">
            <span class="recover__plus-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span class="recover__plus-text">{{ item }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="recover__panel" aria-labelledby="recover-form-title">
      <div class="recover__panel-inner">
        <header class="recover__panel-head">
          <div class="recover__brand recover__brand--mobile">
            <NuxtLink class="recover__brand-link" :to="localePath('/login')">
              <span class="recover__logo">{{ t('brand') }}</span>
            </NuxtLink>
          </div>

          <h2 id="recover-form-title" class="recover__title">
            {{ t('resetPassword.formTitle') }}
          </h2>
          <p class="recover__subtitle">
            {{ t('resetPassword.formSubtitle') }}
          </p>
        </header>

        <form class="recover__form" :aria-busy="pending" @submit.prevent="submit">
          <p v-if="formError" class="recover__error" role="alert">
            {{ formError }}
          </p>

          <div class="recover__field">
            <label class="recover__label" for="reset-code">{{
              t('resetPassword.codeLabel')
            }}</label>
            <input
              id="reset-code"
              :value="code"
              class="ti-input recover__code-input"
              type="text"
              name="code"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="6"
              :disabled="pending"
              :placeholder="t('resetPassword.codePlaceholder')"
              @input="onCodeInput"
            >
            <p class="recover__hint">{{ t('resetPassword.codeHint') }}</p>
          </div>

          <div class="recover__resend-row">
            <button
              type="button"
              class="recover__resend"
              :disabled="
                resendCooldown > 0 || resendPending || pending || !resetToken
              "
              @click="resend"
            >
              {{
                resendPending
                  ? t('resetPassword.sendAgainSending')
                  : t('resetPassword.sendAgain')
              }}
            </button>
            <span
              v-if="resendCooldown > 0"
              class="recover__resend-wait"
              aria-live="polite"
            >
              {{ t('resetPassword.sendAgainWait', { n: resendCooldown }) }}
            </span>
          </div>

          <div class="recover__field">
            <label class="recover__label" for="reset-new-pw">{{
              t('resetPassword.newPasswordLabel')
            }}</label>
            <input
              id="reset-new-pw"
              v-model="newPassword"
              class="ti-input"
              type="password"
              name="newPassword"
              autocomplete="new-password"
              :disabled="pending"
              :placeholder="t('resetPassword.newPasswordPlaceholder')"
            >
            <p class="recover__hint">{{ t('resetPassword.passwordHint') }}</p>
          </div>

          <div class="recover__field">
            <label class="recover__label" for="reset-new-pw2">{{
              t('resetPassword.confirmPasswordLabel')
            }}</label>
            <input
              id="reset-new-pw2"
              v-model="newPasswordConfirm"
              class="ti-input"
              type="password"
              name="newPasswordConfirm"
              autocomplete="new-password"
              :disabled="pending"
              :placeholder="t('resetPassword.confirmPasswordPlaceholder')"
            >
          </div>

          <button
            type="submit"
            class="recover__submit"
            :disabled="pending"
            :aria-busy="pending"
          >
            <span
              v-if="pending"
              class="recover__submit-spinner"
              aria-hidden="true"
            >
              <svg class="recover__submit-spinner-svg" viewBox="0 0 24 24">
                <circle
                  class="recover__submit-spinner-track"
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                />
                <circle
                  class="recover__submit-spinner-arc"
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span class="recover__submit-label">{{
              pending ? t('resetPassword.submitting') : t('resetPassword.submit')
            }}</span>
          </button>

          <button
            type="button"
            class="recover__ghost"
            :disabled="pending"
            @click="goForgotDifferentEmail"
          >
            {{ t('resetPassword.backToForgot') }}
          </button>
        </form>

        <p class="recover__footer">
          <NuxtLink class="recover__link" :to="localePath('/login')">{{
            t('resetPassword.backToLogin')
          }}</NuxtLink>
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.recover--boot {
  align-items: center;
  justify-content: center;
}

.recover__boot {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
}

.recover {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  background: var(--color-surface);
  color: var(--color-on-surface);
}

@media (min-width: 1024px) {
  .recover {
    flex-direction: row;
    align-items: stretch;
  }
}

.recover__aside {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  padding: 2rem 1.5rem;
  overflow: hidden;
  isolation: isolate;
  background:
    radial-gradient(
      ellipse 100% 80% at 95% 5%,
      rgba(2, 102, 255, 0.09),
      transparent 50%
    ),
    radial-gradient(
      ellipse 80% 70% at 5% 95%,
      rgba(0, 80, 204, 0.06),
      transparent 52%
    ),
    radial-gradient(
      ellipse 65% 55% at 65% 50%,
      rgba(179, 197, 255, 0.14),
      transparent 58%
    ),
    linear-gradient(168deg, #f3f6fb 0%, #eef2f8 38%, #f4f6fa 72%, #f7f9fb 100%);
}

.recover__aside::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(
      circle at 18% 78%,
      rgba(2, 102, 255, 0.06) 0%,
      transparent 45%
    ),
    radial-gradient(
      circle at 85% 20%,
      rgba(100, 140, 255, 0.07) 0%,
      transparent 40%
    );
  opacity: 0.55;
}

.recover__aside::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.2;
  background: repeating-linear-gradient(
    -18deg,
    transparent,
    transparent 48px,
    rgba(255, 255, 255, 0.05) 48px,
    rgba(255, 255, 255, 0.05) 49px
  );
}

.recover__aside-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 28rem;
  margin-inline: auto;
}

@media (min-width: 1024px) {
  .recover__aside {
    padding: 3rem 2.5rem 3rem 3rem;
    max-width: 50%;
  }

  .recover__aside-inner {
    margin-inline: 0;
    margin-left: auto;
    margin-right: 2rem;
  }
}

.recover__brand {
  margin-bottom: 2rem;
}

.recover__brand--mobile {
  margin-bottom: 1.25rem;
}

@media (min-width: 1024px) {
  .recover__brand--mobile {
    display: none;
  }
}

.recover__brand-link {
  display: inline-block;
  text-decoration: none;
  color: inherit;
}

.recover__brand-link:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 30%, transparent);
  outline-offset: 4px;
  border-radius: 0.25rem;
}

.recover__logo {
  display: inline-block;
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--color-on-surface);
  line-height: 1;
}

.recover__logo-accent {
  display: block;
  width: 2rem;
  height: 0.25rem;
  margin-top: 0.5rem;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    var(--color-secondary),
    var(--color-secondary-container)
  );
}

.recover__headline {
  margin: 0 0 1rem;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 1.875rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--color-on-surface);
}

.recover__lede {
  margin: 0 0 2rem;
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-on-surface-variant);
}

.recover__pluses {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.recover__plus {
  display: flex;
  gap: 0.875rem;
  align-items: flex-start;
}

.recover__plus-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  margin-top: 0.1rem;
  border-radius: 999px;
  color: var(--color-secondary);
  background: color-mix(in srgb, var(--color-secondary) 12%, transparent);
}

.recover__plus-icon svg {
  width: 0.875rem;
  height: 0.875rem;
}

.recover__plus-text {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--color-on-surface-variant);
}

.recover__panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem 2.5rem;
  background: var(--color-surface-bright);
}

@media (min-width: 1024px) {
  .recover__panel {
    padding: 3rem 2.5rem;
    max-width: 50%;
    background: var(--color-surface-container-lowest);
    box-shadow: var(--shadow-ambient);
  }
}

.recover__panel-inner {
  width: 100%;
  max-width: 28rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.recover__panel-head {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recover__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-on-surface);
}

.recover__subtitle {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
}

.recover__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.recover__error {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--color-on-error-container);
  background: var(--color-error-container);
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
}

.recover__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recover__label {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.recover__hint {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  color: var(--color-on-surface-variant);
}

.recover__code-input {
  font-family: ui-monospace, monospace;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.35em;
  text-align: center;
}

.recover__resend-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
  margin-top: -0.25rem;
}

.recover__resend {
  padding: 0.4rem 0.65rem;
  border: none;
  border-radius: 0.5rem;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-on-secondary);
  cursor: pointer;
  background: linear-gradient(
    135deg,
    var(--color-secondary),
    var(--color-secondary-container)
  );
  transition: opacity 0.2s ease;
}

.recover__resend:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.recover__resend:hover:not(:disabled) {
  opacity: 0.92;
}

.recover__resend:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  outline-offset: 2px;
}

.recover__resend-wait {
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  color: var(--color-on-surface-variant);
}

.recover__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-on-secondary);
  cursor: pointer;
  background: linear-gradient(
    135deg,
    var(--color-secondary),
    var(--color-secondary-container)
  );
  transition: opacity 0.2s ease;
}

.recover__submit:disabled {
  cursor: not-allowed;
  opacity: 0.88;
  pointer-events: none;
}

.recover__submit:hover:not(:disabled) {
  opacity: 0.92;
}

.recover__submit:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  outline-offset: 2px;
}

.recover__ghost {
  align-self: center;
  margin-top: -0.25rem;
  padding: 0.35rem 0.5rem;
  border: none;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-secondary);
  background: transparent;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.recover__ghost:hover:not(:disabled) {
  color: var(--color-secondary-container);
}

.recover__ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.recover__ghost:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 30%, transparent);
  outline-offset: 2px;
  border-radius: 0.25rem;
}

.recover__submit-spinner {
  display: inline-flex;
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
}

.recover__submit-spinner-svg {
  width: 100%;
  height: 100%;
  transform-origin: center;
  animation: recover-submit-spin 0.75s linear infinite;
}

.recover__submit-spinner-track {
  opacity: 0.25;
}

.recover__submit-spinner-arc {
  stroke-dasharray: 42 63;
  transform-origin: 12px 12px;
}

@keyframes recover-submit-spin {
  to {
    transform: rotate(360deg);
  }
}

.recover__submit-label {
  min-width: 0;
}

.recover__footer {
  margin: 0;
  text-align: center;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
}

.recover__link {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-secondary);
  text-decoration: none;
}

.recover__link:hover {
  color: var(--color-secondary-container);
}

@media (max-width: 1023px) {
  .recover__panel {
    order: -1;
  }
}
</style>
