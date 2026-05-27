<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();

const { email, pending, formError, submit } = useForgotPasswordPage();
</script>

<template>
  <AuthFocusedLayout :brand-href="localePath('/login')">
    <template #top-end>
      <AuthBackLink
        :to="localePath('/login')"
        :label="t('forgotPassword.backToLogin')"
      />
    </template>

    <AuthFlowHead
      title-id="forgot-form-title"
      :eyebrow="t('layout.appTagline')"
      :title="t('forgotPassword.formTitle')"
      :subtitle="t('forgotPassword.formSubtitle')"
    />

    <form class="auth-form" :aria-busy="pending" @submit.prevent="submit">
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
  </AuthFocusedLayout>
</template>
