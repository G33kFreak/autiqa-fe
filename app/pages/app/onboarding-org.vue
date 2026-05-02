<script setup lang="ts">
/**
 * Organization onboarding — fullscreen stepped form.
 * Route: /app/onboarding-org (and /en/app/onboarding-org).
 */
const { t } = useI18n();
const localePath = useLocalePath();

const orgStore = useOrganizationStore();

const step = ref(0);
const transitionName = ref<'slide-forward' | 'slide-back'>('slide-forward');

const orgName = ref('');
const orgType = ref('');
const formError = ref('');

const totalSteps = 2;

const goNext = () => {
  formError.value = '';
  if (step.value === 0 && !orgName.value.trim()) {
    formError.value = t('onboardingOrg.errors.nameRequired');
    return;
  }
  if (step.value >= totalSteps - 1) return;
  transitionName.value = 'slide-forward';
  nextTick(() => {
    step.value++;
  });
};

const goBack = () => {
  if (step.value <= 0) return;
  formError.value = '';
  transitionName.value = 'slide-back';
  nextTick(() => {
    step.value--;
  });
};

const submitFinish = async () => {
  formError.value = '';
  const name = orgName.value.trim();
  if (!name) {
    formError.value = t('onboardingOrg.errors.nameRequired');
    return;
  }

  try {
    await orgStore.createOrganization({ name });
    await navigateTo(localePath('/app'), { replace: true });
  } catch {
    formError.value = t('onboardingOrg.errors.generic');
  }
};

useSeoMeta({
  title: computed(() => t('meta.onboardingOrg.title')),
  description: computed(() => t('meta.onboardingOrg.description')),
});

onMounted(() => {
  nextTick(() => {
    const el = document.querySelector<HTMLInputElement>(
      '.onboarding-org__input',
    );
    el?.focus();
  });
});

watch(step, () => {
  nextTick(() => {
    document
      .querySelector<HTMLInputElement>(
        '.onboarding-org__viewport .onboarding-org__input',
      )
      ?.focus();
  });
});
</script>

<template>
  <div class="onboarding-org">
    <div
      class="onboarding-org__glow onboarding-org__glow--tr"
      aria-hidden="true"
    />
    <div
      class="onboarding-org__glow onboarding-org__glow--bl"
      aria-hidden="true"
    />
    <div class="onboarding-org__grid" aria-hidden="true" />

    <main class="onboarding-org__main">
      <div class="onboarding-org__card">
        <div class="onboarding-org__accent" aria-hidden="true" />

        <header class="onboarding-org__head">
          <div class="onboarding-org__brand">
            <span class="onboarding-org__logo">{{ t('brand') }}</span>
          </div>
          <p class="onboarding-org__eyebrow">
            {{ t('onboardingOrg.eyebrow') }}
          </p>
          <h1 class="onboarding-org__title">
            {{ t('onboardingOrg.title') }}
          </h1>
          <p class="onboarding-org__lede">
            {{ t('onboardingOrg.lede') }}
          </p>

          <div
            class="onboarding-org__progress"
            role="navigation"
            :aria-label="t('onboardingOrg.progressAria')"
          >
            <span
              v-for="i in totalSteps"
              :key="i"
              class="onboarding-org__dot"
              :class="{
                'onboarding-org__dot--active': i - 1 === step,
                'onboarding-org__dot--done': i - 1 < step,
              }"
            />
          </div>
          <p class="onboarding-org__step-label">
            {{
              t('onboardingOrg.stepOf', {
                current: step + 1,
                total: totalSteps,
              })
            }}
          </p>
        </header>

        <p v-if="formError" class="onboarding-org__error" role="alert">
          {{ formError }}
        </p>

        <div class="onboarding-org__viewport">
          <Transition :name="transitionName" mode="out-in">
            <div :key="step" class="onboarding-org__step">
              <div v-if="step === 0" class="onboarding-org__fields">
                <label class="onboarding-org__field">
                  <span class="onboarding-org__label">{{
                    t('onboardingOrg.orgNameLabel')
                  }}</span>
                  <input
                    v-model="orgName"
                    type="text"
                    class="ti-input onboarding-org__input"
                    :placeholder="t('onboardingOrg.orgNamePlaceholder')"
                    autocomplete="organization"
                    @keydown.enter.prevent="goNext"
                  >
                </label>

                <div class="onboarding-org__actions">
                  <button
                    type="button"
                    class="onboarding-org__cta"
                    @click="goNext"
                  >
                    {{ t('onboardingOrg.continue') }}
                  </button>
                </div>
              </div>

              <div v-else class="onboarding-org__fields">
                <label class="onboarding-org__field">
                  <span class="onboarding-org__label">{{
                    t('onboardingOrg.orgTypeLabel')
                  }}</span>
                  <input
                    v-model="orgType"
                    type="text"
                    class="ti-input onboarding-org__input"
                    :placeholder="t('onboardingOrg.orgTypePlaceholder')"
                    autocomplete="off"
                    :disabled="orgStore.creating"
                    @keydown.enter.prevent="submitFinish"
                  >
                </label>

                <div class="onboarding-org__actions onboarding-org__actions--split">
                  <button
                    type="button"
                    class="onboarding-org__secondary"
                    :disabled="orgStore.creating"
                    @click="goBack"
                  >
                    {{ t('onboardingOrg.back') }}
                  </button>
                  <button
                    type="button"
                    class="onboarding-org__cta onboarding-org__cta--narrow"
                    :disabled="orgStore.creating"
                    :aria-busy="orgStore.creating"
                    @click="submitFinish"
                  >
                    {{ t('onboardingOrg.finish') }}
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.onboarding-org {
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.25rem, 5vw, 3rem);
  background: var(--color-surface);
  color: var(--color-on-surface);
  overflow: hidden;
}

.onboarding-org__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  opacity: 0.55;
}

.onboarding-org__glow--tr {
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

.onboarding-org__glow--bl {
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

.onboarding-org__grid {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  background-image:
    linear-gradient(var(--color-on-surface) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-on-surface) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
  mask-image: radial-gradient(
    ellipse 80% 70% at 50% 45%,
    black 20%,
    transparent 100%
  );
}

.onboarding-org__main {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: min(42rem, 100%);
}

.onboarding-org__card {
  position: relative;
  padding: clamp(2rem, 5.5vw, 3rem);
  border-radius: 1.5rem;
  background: var(--color-surface-container-low);
  box-shadow: var(--shadow-ambient);
}

.onboarding-org__accent {
  position: absolute;
  left: 0;
  top: 1.75rem;
  bottom: 1.75rem;
  width: 5px;
  border-radius: 0 5px 5px 0;
  background: linear-gradient(
    180deg,
    var(--color-secondary),
    var(--color-secondary-container)
  );
}

.onboarding-org__head {
  padding-left: 1rem;
  margin-bottom: 1.75rem;
}

.onboarding-org__brand {
  margin-bottom: 1.125rem;
}

.onboarding-org__logo {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-on-surface);
}

.onboarding-org__eyebrow {
  margin: 0 0 0.625rem;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-secondary);
}

.onboarding-org__title {
  margin: 0 0 1rem;
  font-family: var(--font-display);
  font-size: clamp(1.875rem, 5.5vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.12;
  color: var(--color-on-surface);
}

.onboarding-org__lede {
  margin: 0 0 1.5rem;
  font-family: var(--font-sans);
  font-size: clamp(1rem, 2.2vw, 1.125rem);
  line-height: 1.6;
  max-width: 38rem;
  color: var(--color-on-surface-variant);
}

.onboarding-org__progress {
  display: flex;
  gap: 0.625rem;
  align-items: center;
  margin-bottom: 0.625rem;
}

.onboarding-org__dot {
  width: 0.5625rem;
  height: 0.5625rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-on-surface-variant) 35%, transparent);
  transition:
    background 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.onboarding-org__dot--active {
  width: 1.75rem;
  background: linear-gradient(
    90deg,
    var(--color-secondary),
    var(--color-secondary-container)
  );
  transform: scale(1);
}

.onboarding-org__dot--done {
  background: color-mix(in srgb, var(--color-secondary) 65%, transparent);
}

.onboarding-org__step-label {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--color-on-surface-variant);
}

.onboarding-org__error {
  margin: 0 0 1.25rem;
  padding: 0.75rem 1rem;
  padding-left: 1rem;
  border-radius: 0.375rem;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--color-on-error-container);
  background: var(--color-error-container);
}

.onboarding-org__viewport {
  position: relative;
  min-height: 13.5rem;
  padding-left: 1rem;
}

.onboarding-org__step {
  width: 100%;
}

.onboarding-org__fields {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.onboarding-org__field {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.onboarding-org__label {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.onboarding-org__input {
  padding: 1rem 1.125rem;
  font-size: 1rem;
  font-weight: 500;
}

.onboarding-org__input::placeholder {
  color: color-mix(in srgb, var(--color-on-surface-variant) 45%, transparent);
}

.onboarding-org__actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.onboarding-org__actions--split {
  flex-direction: row;
  align-items: stretch;
  gap: 0.75rem;
}

.onboarding-org__cta {
  width: 100%;
  padding: 1rem 1.25rem;
  border: none;
  border-radius: 0.875rem;
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-on-secondary);
  cursor: pointer;
  background: var(--color-secondary);
  transition: opacity 0.2s ease, filter 0.2s ease;
}

.onboarding-org__cta--narrow {
  flex: 1;
}

.onboarding-org__actions--split .onboarding-org__secondary {
  flex: 0 0 auto;
  min-width: 5.5rem;
}

.onboarding-org__cta:hover:not(:disabled) {
  filter: brightness(1.06);
}

.onboarding-org__cta:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.onboarding-org__cta:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 40%, transparent);
  outline-offset: 3px;
}

.onboarding-org__secondary {
  padding: 1rem 1.125rem;
  border: none;
  border-radius: 0.875rem;
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-on-surface);
  cursor: pointer;
  background: var(--color-surface-container-high);
  transition: background 0.2s ease;
}

.onboarding-org__secondary:hover {
  background: var(--color-surface-container);
}

.onboarding-org__secondary:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  outline-offset: 2px;
}

/* Forward: new panel enters from the right, current exits left */
.slide-forward-enter-active,
.slide-forward-leave-active {
  transition:
    transform 0.45s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.38s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-forward-enter-from {
  transform: translate3d(1.25rem, 0, 0) scale(0.985);
  opacity: 0;
}

.slide-forward-leave-to {
  transform: translate3d(-1.75rem, 0, 0) scale(0.985);
  opacity: 0;
}

.slide-forward-enter-to,
.slide-forward-leave-from {
  transform: translate3d(0, 0, 0) scale(1);
  opacity: 1;
}

/* Back: reverse */
.slide-back-enter-active,
.slide-back-leave-active {
  transition:
    transform 0.45s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.38s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-back-enter-from {
  transform: translate3d(-1.25rem, 0, 0) scale(0.985);
  opacity: 0;
}

.slide-back-leave-to {
  transform: translate3d(1.75rem, 0, 0) scale(0.985);
  opacity: 0;
}

.slide-back-enter-to,
.slide-back-leave-from {
  transform: translate3d(0, 0, 0) scale(1);
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .slide-forward-enter-active,
  .slide-forward-leave-active,
  .slide-back-enter-active,
  .slide-back-leave-active {
    transition-duration: 0.01ms;
  }

  .onboarding-org__dot--active {
    transition-duration: 0.01ms;
  }
}
</style>
