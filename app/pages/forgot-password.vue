<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();

const { email, pending, formError, pluses, submit } = useForgotPasswordPage();
</script>

<template>
  <AuthSplitLayout>
    <template #aside>
      <AuthAside
        headline-id="forgot-aside-title"
        :kicker="t('layout.appTagline')"
        :headline="t('forgotPassword.asideHeadline')"
        :lede="t('forgotPassword.asideLede')"
        :pluses="pluses"
        :brand-href="localePath('/login')"
      />
    </template>

    <AuthPanel title-id="forgot-form-title">
      <AuthFormHead
        title-id="forgot-form-title"
        :title="t('forgotPassword.formTitle')"
        :subtitle="t('forgotPassword.formSubtitle')"
        show-mobile-brand
        :brand-href="localePath('/login')"
      />

      <form class="auth__form" :aria-busy="pending" @submit.prevent="submit">
        <AuthBanner v-if="formError" variant="error" :message="formError" />

        <AuthField :label="t('forgotPassword.emailLabel')" input-id="forgot-email">
          <input
            id="forgot-email"
            v-model="email"
            class="ti-input"
            type="email"
            name="email"
            autocomplete="email"
            :disabled="pending"
            required
            :placeholder="t('forgotPassword.emailPlaceholder')"
          >
        </AuthField>

        <AuthSubmit
          :pending="pending"
          :label="t('forgotPassword.sendCode')"
          :pending-label="t('forgotPassword.sending')"
        />
      </form>

      <AuthFootnote>
        <NuxtLink class="auth__link" :to="localePath('/login')">
          {{ t('forgotPassword.backToLogin') }}
        </NuxtLink>
      </AuthFootnote>
    </AuthPanel>
  </AuthSplitLayout>
</template>
