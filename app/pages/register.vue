<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();

const {
  name,
  email,
  password,
  passwordConfirm,
  pending,
  formError,
  pluses,
  submit,
} = useRegisterPage();
</script>

<template>
  <AuthSplitLayout>
    <template #aside>
      <AuthAside
        headline-id="register-aside-title"
        :kicker="t('layout.appTagline')"
        :headline="t('register.asideHeadline')"
        :lede="t('register.asideLede')"
        :pluses="pluses"
      />
    </template>

    <AuthPanel title-id="register-form-title">
      <AuthFormHead
        title-id="register-form-title"
        :title="t('register.formTitle')"
        :subtitle="t('register.formSubtitle')"
        show-mobile-brand
      />

      <form class="auth__form" :aria-busy="pending" @submit.prevent="submit">
        <AuthBanner v-if="formError" variant="error" :message="formError" />

        <AuthField :label="t('register.nameLabel')" input-id="register-name">
          <input
            id="register-name"
            v-model="name"
            class="ti-input"
            type="text"
            name="name"
            autocomplete="name"
            required
            :disabled="pending"
            :placeholder="t('register.namePlaceholder')"
          >
        </AuthField>

        <AuthField :label="t('register.emailLabel')" input-id="register-email">
          <input
            id="register-email"
            v-model="email"
            class="ti-input"
            type="email"
            name="email"
            autocomplete="email"
            required
            :disabled="pending"
            :placeholder="t('register.emailPlaceholder')"
          >
        </AuthField>

        <AuthField
          :label="t('register.passwordLabel')"
          input-id="register-password"
          :hint="t('register.passwordHint')"
        >
          <input
            id="register-password"
            v-model="password"
            class="ti-input"
            type="password"
            name="password"
            autocomplete="new-password"
            required
            minlength="8"
            :disabled="pending"
            :placeholder="t('register.passwordPlaceholder')"
          >
        </AuthField>

        <AuthField
          :label="t('register.passwordRepeatLabel')"
          input-id="register-password-confirm"
        >
          <input
            id="register-password-confirm"
            v-model="passwordConfirm"
            class="ti-input"
            type="password"
            name="passwordConfirm"
            autocomplete="new-password"
            required
            :disabled="pending"
            :placeholder="t('register.passwordRepeatPlaceholder')"
          >
        </AuthField>

        <AuthSubmit
          :pending="pending"
          :label="t('register.submit')"
          :pending-label="t('register.submitting')"
        />
      </form>

      <AuthFootnote>
        {{ t('register.footerLead') }}
        <NuxtLink class="auth__link" :to="localePath('/login')">
          {{ t('register.footerLogin') }}
        </NuxtLink>
      </AuthFootnote>
    </AuthPanel>
  </AuthSplitLayout>
</template>
