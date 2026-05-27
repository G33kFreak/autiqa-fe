<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();

const {
  ready,
  code,
  newPassword,
  newPasswordConfirm,
  pending,
  formError,
  resendPending,
  resendCooldown,
  resendDisabled,
  onCodeInput,
  resend,
  submit,
  goForgotDifferentEmail,
} = useResetPasswordPage();
</script>

<template>
  <TiFullScreenLoader v-if="!ready" />

  <AuthFocusedLayout v-else :brand-href="localePath('/login')">
    <template #top-end>
      <AuthBackLink
        :to="localePath('/login')"
        :label="t('resetPassword.backToLogin')"
      />
    </template>

    <AuthFlowHead
      title-id="reset-form-title"
      :eyebrow="t('layout.appTagline')"
      :title="t('resetPassword.formTitle')"
      :subtitle="t('resetPassword.formSubtitle')"
    />

    <form class="auth-form" :aria-busy="pending" @submit.prevent="submit">
      <AuthBanner v-if="formError" variant="error" :message="formError" />

      <AuthField
        :label="t('resetPassword.codeLabel')"
        input-id="reset-code"
        :hint="t('resetPassword.codeHint')"
      >
        <input
          id="reset-code"
          :value="code"
          class="ti-input auth-code-input"
          type="text"
          name="code"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="6"
          :disabled="pending"
          :placeholder="t('resetPassword.codePlaceholder')"
          @input="onCodeInput"
        >
      </AuthField>

      <AuthResendControl
        :pending="resendPending"
        :cooldown="resendCooldown"
        :disabled="resendDisabled"
        :label="t('resetPassword.sendAgain')"
        :pending-label="t('resetPassword.sendAgainSending')"
        :wait-label="t('resetPassword.sendAgainWait', { n: resendCooldown })"
        @resend="resend"
      />

      <AuthField
        :label="t('resetPassword.newPasswordLabel')"
        input-id="reset-new-pw"
        :hint="t('resetPassword.passwordHint')"
      >
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
      </AuthField>

      <AuthField
        :label="t('resetPassword.confirmPasswordLabel')"
        input-id="reset-new-pw2"
      >
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
      </AuthField>

      <AuthSubmit
        :pending="pending"
        :label="t('resetPassword.submit')"
        :pending-label="t('resetPassword.submitting')"
      />

      <AuthGhostButton :disabled="pending" @click="goForgotDifferentEmail">
        {{ t('resetPassword.backToForgot') }}
      </AuthGhostButton>
    </form>
  </AuthFocusedLayout>
</template>
