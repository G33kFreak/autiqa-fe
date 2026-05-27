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
    const el = document.querySelector<HTMLInputElement>('.onboarding-org-input');
    el?.focus();
  });
});

watch(step, () => {
  nextTick(() => {
    document
      .querySelector<HTMLInputElement>('.auth-step-viewport .onboarding-org-input')
      ?.focus();
  });
});
</script>

<template>
  <AuthFocusedLayout max-width="42rem">
    <AuthFlowHead
      title-id="onboarding-org-title"
      :eyebrow="t('onboardingOrg.eyebrow')"
      :title="t('onboardingOrg.title')"
      :subtitle="t('onboardingOrg.lede')"
    />

    <div
      class="auth-progress"
      role="navigation"
      :aria-label="t('onboardingOrg.progressAria')"
    >
      <span
        v-for="i in totalSteps"
        :key="i"
        class="auth-progress__dot"
        :class="{
          'auth-progress__dot--active': i - 1 === step,
          'auth-progress__dot--done': i - 1 < step,
        }"
      />
    </div>
    <p class="auth-step-label">
      {{
        t('onboardingOrg.stepOf', {
          current: step + 1,
          total: totalSteps,
        })
      }}
    </p>

    <AuthBanner v-if="formError" variant="error" :message="formError" />

    <div class="auth-step-viewport">
      <Transition :name="transitionName" mode="out-in">
        <div :key="step" class="auth-step-panel">
          <div v-if="step === 0" class="auth-form">
            <AuthField
              :label="t('onboardingOrg.orgNameLabel')"
              input-id="onboarding-org-name"
            >
              <input
                id="onboarding-org-name"
                v-model="orgName"
                type="text"
                class="ti-input onboarding-org-input"
                :placeholder="t('onboardingOrg.orgNamePlaceholder')"
                autocomplete="organization"
                @keydown.enter.prevent="goNext"
              >
            </AuthField>

            <div class="auth-flow-actions">
              <button type="button" class="app-btn app-btn--primary" @click="goNext">
                {{ t('onboardingOrg.continue') }}
              </button>
            </div>
          </div>

          <div v-else class="auth-form">
            <AuthField
              :label="t('onboardingOrg.orgTypeLabel')"
              input-id="onboarding-org-type"
            >
              <input
                id="onboarding-org-type"
                v-model="orgType"
                type="text"
                class="ti-input onboarding-org-input"
                :placeholder="t('onboardingOrg.orgTypePlaceholder')"
                autocomplete="off"
                :disabled="orgStore.creating"
                @keydown.enter.prevent="submitFinish"
              >
            </AuthField>

            <div class="auth-flow-actions auth-flow-actions--split">
              <button
                type="button"
                class="app-btn app-btn--secondary"
                :disabled="orgStore.creating"
                @click="goBack"
              >
                {{ t('onboardingOrg.back') }}
              </button>
              <button
                type="button"
                class="app-btn app-btn--primary"
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
  </AuthFocusedLayout>
</template>
