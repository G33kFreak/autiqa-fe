<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();

const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const formError = ref('');

useSeoMeta({
  title: computed(() => t('meta.register.title')),
  description: computed(() => t('meta.register.description')),
});

function validate(): boolean {
  formError.value = '';
  const n = name.value.trim();
  const e = email.value.trim();
  const p = password.value;
  const c = passwordConfirm.value;

  if (!n) {
    formError.value = t('register.errors.nameRequired');
    return false;
  }
  if (!e) {
    formError.value = t('register.errors.emailRequired');
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    formError.value = t('register.errors.emailInvalid');
    return false;
  }
  if (p.length < 8) {
    formError.value = t('register.errors.passwordShort');
    return false;
  }
  if (p !== c) {
    formError.value = t('register.errors.passwordMismatch');
    return false;
  }
  return true;
}

function submit() {
  if (!validate()) return;
  /* Register API — wire when backend is ready */
}
</script>

<template>
  <div class="register">
    <div class="register__bg" aria-hidden="true" />

    <main class="register__main">
      <div class="register__card">
        <header class="register__head">
          <div class="register__brand">
            <span class="register__logo">{{ t('brand') }}</span>
            <span class="register__logo-accent" aria-hidden="true" />
          </div>
          <h1 class="register__title">{{ t('register.formTitle') }}</h1>
          <p class="register__subtitle">{{ t('register.formSubtitle') }}</p>
        </header>

        <form class="register__form" @submit.prevent="submit">
          <p v-if="formError" class="register__error" role="alert">
            {{ formError }}
          </p>

          <div class="register__field">
            <label class="register__label" for="register-name">{{
              t('register.nameLabel')
            }}</label>
            <input
              id="register-name"
              v-model="name"
              class="ti-input"
              type="text"
              name="name"
              autocomplete="name"
              required
              :placeholder="t('register.namePlaceholder')"
            >
          </div>

          <div class="register__field">
            <label class="register__label" for="register-email">{{
              t('register.emailLabel')
            }}</label>
            <input
              id="register-email"
              v-model="email"
              class="ti-input"
              type="email"
              name="email"
              autocomplete="email"
              required
              :placeholder="t('register.emailPlaceholder')"
            >
          </div>

          <div class="register__field">
            <label class="register__label" for="register-password">{{
              t('register.passwordLabel')
            }}</label>
            <input
              id="register-password"
              v-model="password"
              class="ti-input"
              type="password"
              name="password"
              autocomplete="new-password"
              required
              minlength="8"
              :placeholder="t('register.passwordPlaceholder')"
            >
            <p class="register__hint">{{ t('register.passwordHint') }}</p>
          </div>

          <div class="register__field">
            <label class="register__label" for="register-password-confirm">{{
              t('register.passwordRepeatLabel')
            }}</label>
            <input
              id="register-password-confirm"
              v-model="passwordConfirm"
              class="ti-input"
              type="password"
              name="passwordConfirm"
              autocomplete="new-password"
              required
              :placeholder="t('register.passwordRepeatPlaceholder')"
            >
          </div>

          <button type="submit" class="register__submit">
            {{ t('register.submit') }}
          </button>
        </form>

        <p class="register__footer">
          {{ t('register.footerLead') }}
          <NuxtLink class="register__link" :to="localePath('/login')">
            {{ t('register.footerLogin') }}
          </NuxtLink>
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.register {
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: var(--color-surface);
  color: var(--color-on-surface);
  overflow-x: hidden;
}

.register__bg {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(
      ellipse 90% 70% at 100% 0%,
      rgba(2, 102, 255, 0.08),
      transparent 55%
    ),
    radial-gradient(
      ellipse 70% 60% at 0% 100%,
      rgba(0, 80, 204, 0.06),
      transparent 50%
    ),
    radial-gradient(
      ellipse 55% 45% at 50% 40%,
      rgba(179, 197, 255, 0.12),
      transparent 58%
    ),
    linear-gradient(168deg, #f3f6fb 0%, #eef2f8 42%, #f7f9fb 100%);
}

.register__main {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 26rem;
}

.register__card {
  padding: 2rem 1.75rem;
  border-radius: 1rem;
  background: var(--color-surface-container-low);
  box-shadow:
    0 12px 32px rgba(25, 28, 30, 0.06),
    0 0 0 1px color-mix(in srgb, var(--color-outline-variant) 12%, transparent);
}

.register__head {
  margin-bottom: 1.75rem;
  text-align: center;
}

.register__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.register__logo {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-on-surface);
}

.register__logo-accent {
  width: 4px;
  height: 1.25rem;
  border-radius: 2px;
  background: linear-gradient(
    180deg,
    var(--color-secondary),
    var(--color-secondary-container)
  );
}

.register__title {
  margin: 0 0 0.5rem;
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: var(--color-on-surface);
}

.register__subtitle {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-on-surface-variant);
}

.register__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.register__error {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--color-on-error-container);
  background: var(--color-error-container);
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
}

.register__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.register__label {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.register__hint {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--color-on-surface-variant);
}

.register__submit {
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

.register__submit:hover {
  opacity: 0.92;
}

.register__submit:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  outline-offset: 2px;
}

.register__footer {
  margin: 1.75rem 0 0;
  text-align: center;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
}

.register__link {
  font-weight: 500;
  color: var(--color-secondary);
  text-decoration: none;
}

.register__link:hover {
  color: var(--color-secondary-container);
}
</style>
