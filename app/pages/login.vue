<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();

const {
  email,
  password,
  pending,
  formError,
  passwordResetBanner,
  showAuthLoader,
  pluses,
  submit,
} = useLoginPage();
</script>

<template>
  <TiFullScreenLoader v-if="showAuthLoader" />

  <AuthSplitLayout v-else>
    <template #aside>
      <AuthAside
        headline-id="login-aside-title"
        :kicker="t('layout.appTagline')"
        :headline="t('login.asideHeadline')"
        :lede="t('login.asideLede')"
        :pluses="pluses"
      />
    </template>

    <AuthPanel title-id="login-form-title">
      <AuthFormHead
        title-id="login-form-title"
        :title="t('login.formTitle')"
        :subtitle="t('login.formSubtitle')"
        show-mobile-brand
      />

      <form class="auth__form" :aria-busy="pending" @submit.prevent="submit">
        <AuthBanner
          v-if="passwordResetBanner"
          variant="success"
          :message="t('login.passwordResetSuccess')"
        />
        <AuthBanner v-if="formError" variant="error" :message="formError" />

        <AuthField :label="t('login.emailLabel')" input-id="login-email">
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
        </AuthField>

        <AuthField :label="t('login.passwordLabel')" input-id="login-password">
          <template #label-row>
            <NuxtLink
              class="auth__link auth__link--small"
              :to="localePath('/forgot-password')"
            >
              {{ t('login.forgotPassword') }}
            </NuxtLink>
          </template>
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
        </AuthField>

        <AuthSubmit
          :pending="pending"
          :label="t('login.submit')"
          :pending-label="t('login.submitting')"
        />
      </form>

      <AuthFootnote>
        {{ t('login.footerLead') }}
        <NuxtLink class="auth__link" :to="localePath('/register')">
          {{ t('login.requestAccess') }}
        </NuxtLink>
      </AuthFootnote>
    </AuthPanel>
  </AuthSplitLayout>
</template>
