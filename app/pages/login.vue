<script setup lang="ts">
import { FetchError } from 'ofetch';
import { StatusCodes } from 'http-status-codes';

/** Stable order; each key maps to `login.pluses.<key>` in locale files. */
const LOGIN_PLUS_KEYS = ['liveMap', 'kpis', 'roles', 'margins'] as const;

const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const pending = ref(false);
const formError = ref('');

const pluses = computed(() =>
  LOGIN_PLUS_KEYS.map((key) => t(`login.pluses.${key}`)),
);

const showAuthLoader = ref(!authStore.getIsInitialized);

onMounted(async () => {
  if (authStore.getIsInitialized) return;

  const isAuthenticated = await authStore.initAuth();
  if (!isAuthenticated) {
    showAuthLoader.value = false;
    return;
  }

  const { redirect } = route.query;
  navigateTo(redirect?.toString() ?? '/app');
});

useSeoMeta({
  title: computed(() => t('meta.login.title')),
  description: computed(() => t('meta.login.description')),
});

async function submit() {
  formError.value = '';
  const trimmedEmail = email.value.trim();
  if (!trimmedEmail || !password.value) {
    formError.value = t('login.errors.required');
    return;
  }

  pending.value = true;
  try {
    await authStore.login(trimmedEmail, password.value);

    const q = route.query.redirect;
    const afterLogin =
      typeof q === 'string' && q.startsWith('/') && !q.startsWith('//')
        ? q
        : '/app';
    await navigateTo(afterLogin);
  } catch (e: unknown) {
    const status = e instanceof FetchError ? (e.status ?? e.statusCode) : 0;
    formError.value =
      status === StatusCodes.UNAUTHORIZED || status === StatusCodes.FORBIDDEN
        ? t('login.errors.invalid')
        : t('login.errors.generic');
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <TiFullScreenLoader v-if="showAuthLoader" />

  <div v-else class="login">
    <section class="login__aside" aria-labelledby="login-aside-title">
      <div class="login__aside-inner">
        <header class="login__brand">
          <span class="login__logo">{{ t('brand') }}</span>
          <span class="login__logo-accent" aria-hidden="true" />
        </header>

        <h1 id="login-aside-title" class="login__headline">
          {{ t('login.asideHeadline') }}
        </h1>
        <p class="login__lede">
          {{ t('login.asideLede') }}
        </p>

        <ul class="login__pluses">
          <li v-for="(item, i) in pluses" :key="i" class="login__plus">
            <span class="login__plus-icon" aria-hidden="true">
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
            <span class="login__plus-text">{{ item }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="login__panel" aria-labelledby="login-form-title">
      <div class="login__panel-inner">
        <header class="login__panel-head">
          <div class="login__brand login__brand--mobile">
            <span class="login__logo">{{ t('brand') }}</span>
          </div>
          <h2 id="login-form-title" class="login__title">
            {{ t('login.formTitle') }}
          </h2>
          <p class="login__subtitle">
            {{ t('login.formSubtitle') }}
          </p>
        </header>

        <!--
          TEMPORARILY DISABLED: Google SSO entrypoint and divider.
          Keep this block commented for quick restore later.
        <button type="button" class="login__sso">
          <span class="login__sso-icon" aria-hidden="true">
            <svg
              class="login__google"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </span>
          <span>{{ t('login.continueGoogle') }}</span>
        </button>

        <div class="login__divider" role="separator">
          <span class="login__divider-line" />
          <span class="login__divider-label">{{ t('login.dividerOr') }}</span>
          <span class="login__divider-line" />
        </div>
        -->

        <form class="login__form" :aria-busy="pending" @submit.prevent="submit">
          <p v-if="formError" class="login__error" role="alert">
            {{ formError }}
          </p>

          <div class="login__field">
            <label class="login__label" for="login-email">{{
              t('login.emailLabel')
            }}</label>
            <input
              id="login-email"
              v-model="email"
              class="ti-input"
              type="email"
              name="email"
              autocomplete="email"
              :disabled="pending"
              required
              :placeholder="t('login.emailPlaceholder')"
            >
          </div>

          <div class="login__field">
            <div class="login__row">
              <label class="login__label" for="login-password">{{
                t('login.passwordLabel')
              }}</label>
              <a href="#" class="login__link login__link--small" @click.prevent>
                {{ t('login.forgotPassword') }}
              </a>
            </div>
            <input
              id="login-password"
              v-model="password"
              class="ti-input"
              type="password"
              name="password"
              autocomplete="current-password"
              :disabled="pending"
              required
              :placeholder="t('login.passwordPlaceholder')"
            >
          </div>

          <button
            type="submit"
            class="login__submit"
            :disabled="pending"
            :aria-busy="pending"
          >
            <span
              v-if="pending"
              class="login__submit-spinner"
              aria-hidden="true"
            >
              <svg class="login__submit-spinner-svg" viewBox="0 0 24 24">
                <circle
                  class="login__submit-spinner-track"
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                />
                <circle
                  class="login__submit-spinner-arc"
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
            <span class="login__submit-label">{{
              pending ? t('login.submitting') : t('login.submit')
            }}</span>
          </button>
        </form>

        <p class="login__footer">
          {{ t('login.footerLead') }}
          <NuxtLink class="login__link" :to="localePath('/register')">{{
            t('login.requestAccess')
          }}</NuxtLink>
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.login {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  background: var(--color-surface);
  color: var(--color-on-surface);
}

@media (min-width: 1024px) {
  .login {
    flex-direction: row;
    align-items: stretch;
  }
}

/* Left: benefits — soft cool tint (lighter than before) */
.login__aside {
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

.login__aside::before {
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

.login__aside::after {
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

.login__aside-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 28rem;
  margin-inline: auto;
}

@media (min-width: 1024px) {
  .login__aside {
    padding: 3rem 2.5rem 3rem 3rem;
    max-width: 50%;
  }

  .login__aside-inner {
    margin-inline: 0;
    margin-left: auto;
    margin-right: 2rem;
  }
}

.login__brand {
  margin-bottom: 2rem;
}

.login__brand--mobile {
  margin-bottom: 1.25rem;
}

@media (min-width: 1024px) {
  .login__brand--mobile {
    display: none;
  }
}

.login__logo {
  display: inline-block;
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--color-on-surface);
  line-height: 1;
}

.login__logo-accent {
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

.login__headline {
  margin: 0 0 1rem;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 1.875rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--color-on-surface);
}

.login__lede {
  margin: 0 0 2rem;
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-on-surface-variant);
}

.login__pluses {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.login__plus {
  display: flex;
  gap: 0.875rem;
  align-items: flex-start;
}

.login__plus-icon {
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

.login__plus-icon svg {
  width: 0.875rem;
  height: 0.875rem;
}

.login__plus-text {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--color-on-surface-variant);
}

/* Right: form panel */
.login__panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem 2.5rem;
  background: var(--color-surface-bright);
}

@media (min-width: 1024px) {
  .login__panel {
    padding: 3rem 2.5rem;
    max-width: 50%;
    background: var(--color-surface-container-lowest);
    box-shadow: var(--shadow-ambient);
  }
}

.login__panel-inner {
  width: 100%;
  max-width: 28rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.login__panel-head {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.login__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-on-surface);
}

.login__subtitle {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
}

.login__sso {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-on-surface);
  background: var(--color-surface-container-lowest);
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--color-outline-variant) 15%, transparent);
  cursor: pointer;
  transition: background 0.2s ease;
}

.login__sso:hover {
  background: var(--color-surface-container-low);
}

.login__sso:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 30%, transparent);
  outline-offset: 2px;
}

.login__sso-icon {
  display: flex;
}

.login__google {
  width: 1.25rem;
  height: 1.25rem;
}

.login__divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.login__divider-line {
  flex: 1;
  height: 1px;
  background: color-mix(in srgb, var(--color-outline-variant) 15%, transparent);
}

.login__divider-label {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.login__error {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--color-on-error-container);
  background: var(--color-error-container);
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
}

.login__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.login__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.login__label {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.login__link {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-secondary);
  text-decoration: none;
}

.login__link:hover {
  color: var(--color-secondary-container);
}

.login__link--small {
  font-size: 0.75rem;
}

.login__submit {
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

.login__submit:disabled {
  cursor: not-allowed;
  opacity: 0.88;
  pointer-events: none;
}

.login__submit:hover:not(:disabled) {
  opacity: 0.92;
}

.login__submit:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  outline-offset: 2px;
}

.login__submit-spinner {
  display: inline-flex;
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
}

.login__submit-spinner-svg {
  width: 100%;
  height: 100%;
  transform-origin: center;
  animation: login-submit-spin 0.75s linear infinite;
}

.login__submit-spinner-track {
  opacity: 0.25;
}

.login__submit-spinner-arc {
  stroke-dasharray: 42 63;
  transform-origin: 12px 12px;
}

@keyframes login-submit-spin {
  to {
    transform: rotate(360deg);
  }
}

.login__submit-label {
  min-width: 0;
}

.login__footer {
  margin: 0;
  text-align: center;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
}

/* Mobile: form before benefits (conversion-first) */
@media (max-width: 1023px) {
  .login__panel {
    order: -1;
  }
}
</style>
