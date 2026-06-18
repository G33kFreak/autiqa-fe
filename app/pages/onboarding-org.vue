<script setup lang="ts">
import { FetchError } from 'ofetch'
import { StatusCodes } from 'http-status-codes'

definePageMeta({ layout: false })

const { t } = useI18n()
const localePath = useLocalePath()
const authStore = useAuthStore()
const orgStore = useOrganizationStore()

const NAME_MAX = 60

const name = ref('')
const pending = ref(false)
const formError = ref('')
const signingOut = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)

const trimmed = computed(() => name.value.trim())
const canSubmit = computed(() => trimmed.value.length >= 1)

/** Live preview of the org chip the user will see in the app top bar. */
const previewName = computed(
  () => trimmed.value || t('onboardingOrg.previewPlaceholder'),
)
const previewInitial = computed(
  () => trimmed.value.charAt(0).toUpperCase() || '?',
)

async function submit() {
  if (pending.value || !canSubmit.value) {
    if (!canSubmit.value) formError.value = t('onboardingOrg.errors.invalid')
    return
  }

  pending.value = true
  formError.value = ''

  try {
    await orgStore.createOrganization(trimmed.value)
    await navigateTo(localePath('/app'), { replace: true })
  } catch (e: unknown) {
    const status = e instanceof FetchError ? (e.status ?? e.statusCode) : 0

    // Already owns one (e.g. created in another tab) — refresh and continue in.
    if (status === StatusCodes.CONFLICT) {
      orgStore.reset()
      try {
        await orgStore.ensureLoaded()
      } catch {
        /* fall through to /app; the guard will re-resolve */
      }
      await navigateTo(localePath('/app'), { replace: true })
      return
    }

    formError.value =
      status === StatusCodes.BAD_REQUEST
        ? t('onboardingOrg.errors.invalid')
        : t('onboardingOrg.errors.generic')
  } finally {
    pending.value = false
  }
}

async function signOut() {
  if (signingOut.value) return
  signingOut.value = true
  try {
    await authStore.logout()
  } finally {
    signingOut.value = false
  }
}

onMounted(() => {
  nextTick(() => nameInput.value?.focus())
})

useSeoMeta({
  title: () => t('onboardingOrg.metaTitle'),
  description: () => t('onboardingOrg.metaDescription'),
})
</script>

<template>
  <main class="ob-root">
    <section class="ob-card">

      <NuxtLink :to="localePath('/')" class="ob-logo" :aria-label="t('onboardingOrg.backToHome')">
        <AutiqaLogo :size="28" />
      </NuxtLink>

      <header class="ob-head">
        <p class="ob-step">{{ t('onboardingOrg.step') }}</p>
        <h1 class="ob-title">{{ t('onboardingOrg.title') }}</h1>
        <p class="ob-subtitle">{{ t('onboardingOrg.subtitle') }}</p>
      </header>

      <form class="ob-form" novalidate :aria-busy="pending" @submit.prevent="submit">

        <transition name="ob-fade">
          <div v-if="formError" class="ob-banner ob-banner--error" role="alert">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4" />
              <line x1="8" y1="4.75" x2="8" y2="8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              <circle cx="8" cy="11" r="0.7" fill="currentColor" />
            </svg>
            <span>{{ formError }}</span>
          </div>
        </transition>

        <div class="ob-field">
          <label class="ob-label" for="ob-name">{{ t('onboardingOrg.nameLabel') }}</label>
          <input
            id="ob-name"
            ref="nameInput"
            v-model="name"
            type="text"
            class="ob-input"
            :placeholder="t('onboardingOrg.namePlaceholder')"
            :maxlength="NAME_MAX"
            autocomplete="organization"
            :disabled="pending"
            @input="formError = ''"
          >
        </div>

        <!-- Live preview: the exact org chip from the app top bar -->
        <div class="ob-preview" aria-hidden="true">
          <span class="ob-preview__label">{{ t('onboardingOrg.previewLabel') }}</span>
          <div class="ob-preview__bar">
            <span class="ob-preview__chip" :class="{ 'is-empty': !trimmed }">
              <span class="ob-preview__avatar">{{ previewInitial }}</span>
              <span class="ob-preview__name">{{ previewName }}</span>
              <span class="ob-preview__chevron">
                <AppIcon name="chevron" :size="16" />
              </span>
            </span>
          </div>
        </div>

        <button type="submit" class="ob-submit" :disabled="!canSubmit || pending">
          <span v-if="!pending">{{ t('onboardingOrg.submit') }}</span>
          <span v-else class="ob-spinner" aria-hidden="true" />
          <span v-if="pending" class="sr-only">{{ t('onboardingOrg.submitPending') }}</span>
        </button>

      </form>

      <p class="ob-signout">
        <span>{{ t('onboardingOrg.signOutLead') }}</span>
        <button type="button" class="ob-link" :disabled="signingOut" @click="signOut">
          {{ signingOut ? t('onboardingOrg.signingOut') : t('onboardingOrg.signOut') }}
        </button>
      </p>

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
.ob-root {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: var(--space-8) var(--space-6);
}

.ob-card {
  width: 100%;
  max-width: 26rem;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  animation: ob-rise 0.5s var(--ease-out) both;
}

.ob-logo {
  display: inline-flex;
  align-items: center;
  align-self: center;
}

/* ── Header ────────────────────────────────────────────────── */
.ob-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-2);
}

.ob-step {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.ob-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.12;
  color: var(--color-ink);
  text-wrap: balance;
}

.ob-subtitle {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--color-muted);
  max-width: 36ch;
  text-wrap: pretty;
}

/* ── Form ──────────────────────────────────────────────────── */
.ob-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.ob-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.ob-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-ink);
  line-height: 1;
}

.ob-input {
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
  outline: none;
  appearance: none;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.ob-input::placeholder {
  color: var(--color-muted);
  opacity: 0.55;
}

.ob-input:hover:not(:disabled) {
  border-color: oklch(0.680 0.012 268);
}

.ob-input:focus {
  border-color: var(--color-primary);
  background: var(--color-bg);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

.ob-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Live preview ──────────────────────────────────────────── */
.ob-preview {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.ob-preview__label {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
}

/* A fragment of the app top bar, so the chip reads in its real context. */
.ob-preview__bar {
  display: flex;
  justify-content: flex-end;
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-lg);
}

.ob-preview__chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  max-width: 100%;
  padding: 0 var(--space-2);
  height: 40px;
  border-radius: var(--radius-md);
}

.ob-preview__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  font-weight: 600;
  transition: background-color var(--duration-ui) var(--ease-out);
}

.ob-preview__chip.is-empty .ob-preview__avatar {
  background: var(--color-surface-high);
  color: var(--color-muted);
}

.ob-preview__name {
  max-width: 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-ink);
  transition: color var(--duration-ui) var(--ease-out);
}

.ob-preview__chip.is-empty .ob-preview__name {
  color: var(--color-muted);
}

.ob-preview__chevron {
  display: inline-flex;
  color: var(--color-muted);
}

/* ── Submit ────────────────────────────────────────────────── */
.ob-submit {
  position: relative;
  width: 100%;
  min-height: 2.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
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

.ob-submit:hover:not(:disabled) {
  background: var(--color-primary-hover);
  box-shadow: 0 4px 16px var(--color-primary-subtle);
}

.ob-submit:active:not(:disabled) {
  transform: scale(0.985);
}

.ob-submit:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

.ob-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ob-spinner {
  width: 1.125rem;
  height: 1.125rem;
  border: 2px solid oklch(1 0 0 / 0.35);
  border-top-color: var(--color-on-primary);
  border-radius: 50%;
  animation: ob-spin 0.7s linear infinite;
}

/* ── Error banner ──────────────────────────────────────────── */
.ob-banner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0.625rem 0.875rem;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.4;
}

.ob-banner--error {
  background: var(--color-risk-bg);
  border: 1px solid oklch(0.420 0.180 26 / 0.22);
  color: var(--color-risk);
}

.ob-banner svg {
  flex-shrink: 0;
}

/* ── Sign out ──────────────────────────────────────────────── */
.ob-signout {
  margin: 0;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4ch;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.ob-link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-weight: 600;
  color: var(--color-primary);
  transition: opacity var(--duration-fast) var(--ease-out);
}

.ob-link:hover:not(:disabled) {
  opacity: 0.75;
}

.ob-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.ob-link:disabled {
  color: var(--color-muted);
  cursor: progress;
}

/* ── Transitions ───────────────────────────────────────────── */
.ob-fade-enter-active,
.ob-fade-leave-active {
  transition:
    opacity var(--duration-ui) var(--ease-out),
    transform var(--duration-ui) var(--ease-out);
}

.ob-fade-enter-from,
.ob-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes ob-rise {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes ob-spin {
  to { transform: rotate(360deg); }
}

/* ── Reduced motion ────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .ob-card {
    animation: none;
  }

  .ob-input,
  .ob-submit,
  .ob-link,
  .ob-preview__avatar,
  .ob-preview__name {
    transition: none;
  }

  .ob-spinner {
    animation-duration: 1.4s;
  }

  .ob-fade-enter-active,
  .ob-fade-leave-active {
    transition: opacity var(--duration-fast) var(--ease-out);
  }

  .ob-fade-enter-from,
  .ob-fade-leave-to {
    transform: none;
  }
}
</style>
