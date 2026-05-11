<script setup lang="ts">
import { FetchError } from 'ofetch';
import { StatusCodes } from 'http-status-codes';
import { requestForgotPassword } from '~/api/auth';
import {
  clearResetPasswordTokenFromStorage,
  writeResetPasswordTokenToStorage,
} from '~/utils/reset-password-token-storage';

const RECOVER_PLUS_KEYS = ['otp', 'window', 'login'] as const;

const { t } = useI18n();
const localePath = useLocalePath();
const { nuxtApi } = useApi();

const email = ref('');
const pending = ref(false);
const formError = ref('');

const pluses = computed(() =>
  RECOVER_PLUS_KEYS.map((key) => t(`forgotPassword.pluses.${key}`)),
);

onMounted(() => {
  clearResetPasswordTokenFromStorage();
});

useSeoMeta({
  title: computed(() => t('meta.forgotPassword.title')),
  description: computed(() => t('meta.forgotPassword.description')),
});

function upstreamMessage(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  const m = (data as { message?: unknown }).message;
  if (typeof m === 'string') return m;
  if (Array.isArray(m) && typeof m[0] === 'string') return m[0];
  return '';
}

function mapForgotError(e: unknown): string {
  if (!(e instanceof FetchError)) return t('forgotPassword.errors.generic');
  const status = e.status ?? e.statusCode ?? 0;
  if (status === StatusCodes.TOO_MANY_REQUESTS)
    return t('forgotPassword.errors.rateLimit');
  if (status === StatusCodes.BAD_REQUEST) {
    const raw = upstreamMessage(e.data);
    if (raw) return raw;
    return t('forgotPassword.errors.badRequest');
  }
  return t('forgotPassword.errors.generic');
}

async function submit() {
  formError.value = '';
  const trimmed = email.value.trim();
  if (!trimmed) {
    formError.value = t('forgotPassword.errors.emailRequired');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    formError.value = t('forgotPassword.errors.emailInvalid');
    return;
  }

  pending.value = true;
  try {
    const { resetRequestToken } = await requestForgotPassword(nuxtApi, {
      email: trimmed,
    });
    writeResetPasswordTokenToStorage(resetRequestToken);
    await navigateTo({
      path: localePath('/reset-password'),
      query: { token: resetRequestToken },
    });
  } catch (e: unknown) {
    formError.value = mapForgotError(e);
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div class="recover">
    <section class="recover__aside" aria-labelledby="recover-aside-title">
      <div class="recover__aside-inner">
        <header class="recover__brand">
          <NuxtLink class="recover__brand-link" :to="localePath('/login')">
            <span class="recover__logo">{{ t('brand') }}</span>
            <span class="recover__logo-accent" aria-hidden="true" />
          </NuxtLink>
        </header>

        <h1 id="recover-aside-title" class="recover__headline">
          {{ t('forgotPassword.asideHeadline') }}
        </h1>
        <p class="recover__lede">
          {{ t('forgotPassword.asideLede') }}
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
            {{ t('forgotPassword.formTitle') }}
          </h2>
          <p class="recover__subtitle">
            {{ t('forgotPassword.formSubtitle') }}
          </p>
        </header>

        <form class="recover__form" :aria-busy="pending" @submit.prevent="submit">
          <p v-if="formError" class="recover__error" role="alert">
            {{ formError }}
          </p>

          <div class="recover__field">
            <label class="recover__label" for="recover-email">{{
              t('forgotPassword.emailLabel')
            }}</label>
            <input
              id="recover-email"
              v-model="email"
              class="ti-input"
              type="email"
              name="email"
              autocomplete="email"
              :disabled="pending"
              required
              :placeholder="t('forgotPassword.emailPlaceholder')"
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
              pending ? t('forgotPassword.sending') : t('forgotPassword.sendCode')
            }}</span>
          </button>
        </form>

        <p class="recover__footer">
          <NuxtLink class="recover__link" :to="localePath('/login')">{{
            t('forgotPassword.backToLogin')
          }}</NuxtLink>
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
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
