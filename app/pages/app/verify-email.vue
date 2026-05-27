<script setup lang="ts">
import { FetchError } from 'ofetch';
import { StatusCodes } from 'http-status-codes';

/**
 * Fullscreen email verification — 6-digit OTP; submits to `POST /auth/verify-email`.
 * Intended when `user.isActive === false` until email is confirmed.
 */
definePageMeta({
  i18n: false,
});

const { t } = useI18n();
const authStore = useAuthStore();

const digits = ref(['', '', '', '', '', '']);
const otpRefs = ref<(HTMLInputElement | null)[]>([]);
const pending = ref(false);
const submitError = ref('');

function setOtpRef(el: unknown, i: number) {
  otpRefs.value[i] = (el as HTMLInputElement | null) ?? null;
}

const codeComplete = computed(() => digits.value.every((d) => d.length === 1));

const displayEmail = computed(() => {
  const email = authStore.user?.email;
  if (!email) return t('verifyEmail.emailUnknown');
  const at = email.indexOf('@');
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (local.length <= 2) return `${local}@${domain}`;
  return `${local.slice(0, 2)}${'\u2009'}·\u2009·\u2009·\u2009@${domain}`;
});

function onDigitInput(i: number, raw: string) {
  const v = raw.replace(/\D/g, '').slice(-1);
  digits.value[i] = v;
  if (v && i < 5) {
    nextTick(() => otpRefs.value[i + 1]?.focus());
  }
}

function onDigitKeydown(e: KeyboardEvent, i: number) {
  if (e.key === 'Backspace' && !digits.value[i] && i > 0) {
    otpRefs.value[i - 1]?.focus();
  }
}

function onPaste(e: ClipboardEvent, startIndex: number) {
  e.preventDefault();
  const text = e.clipboardData?.getData('text') ?? '';
  const nums = text.replace(/\D/g, '').slice(0, 6).split('');
  if (!nums.length) return;
  const next = [...digits.value];
  for (let k = 0; k < nums.length && startIndex + k < 6; k++) {
    next[startIndex + k] = nums[k]!;
  }
  digits.value = next;
  const focusAt = Math.min(startIndex + nums.length, 5);
  nextTick(() => otpRefs.value[focusAt]?.focus());
}

async function onSubmit() {
  if (!codeComplete.value || pending.value) return;
  submitError.value = '';
  pending.value = true;
  try {
    await authStore.verifyEmail(digits.value.join(''));
    await navigateTo('/app', { replace: true });
  } catch (e: unknown) {
    const status = e instanceof FetchError ? (e.status ?? e.statusCode) : 0;
    if (status === StatusCodes.BAD_REQUEST) {
      submitError.value = t('verifyEmail.errors.invalidCode');
    } else {
      submitError.value = t('verifyEmail.errors.generic');
    }
  } finally {
    pending.value = false;
  }
}

function onResend() {
  /* Wire resend OTP when backend is ready */
}

async function onLogout() {
  await authStore.logout();
}

useSeoMeta({
  title: computed(() => t('meta.verifyEmail.title')),
  description: computed(() => t('meta.verifyEmail.description')),
});

onMounted(() => {
  nextTick(() => otpRefs.value[0]?.focus());
});
</script>

<template>
  <AuthFocusedLayout>
    <AuthFlowHead
      title-id="verify-email-title"
      :eyebrow="t('verifyEmail.eyebrow')"
      :title="t('verifyEmail.title')"
      :subtitle="t('verifyEmail.subtitle', { email: displayEmail })"
    />

    <form class="auth-form" :aria-busy="pending" @submit.prevent="onSubmit">
      <AuthBanner v-if="submitError" variant="error" :message="submitError" />

      <span class="auth-otp-label">{{ t('verifyEmail.otpLabel') }}</span>
      <div
        class="auth-otp"
        role="group"
        :aria-label="t('verifyEmail.otpAria')"
      >
        <input
          v-for="i in [0, 1, 2, 3, 4, 5]"
          :key="i"
          :ref="(el) => setOtpRef(el, i)"
          class="auth-otp__digit"
          type="text"
          inputmode="numeric"
          maxlength="1"
          autocomplete="one-time-code"
          :value="digits[i]"
          :aria-label="t('verifyEmail.digitAria', { n: i + 1 })"
          :disabled="pending"
          @input="onDigitInput(i, ($event.target as HTMLInputElement).value)"
          @keydown="onDigitKeydown($event, i)"
          @paste="onPaste($event, i)"
        >
      </div>

      <button
        type="submit"
        class="app-btn app-btn--primary auth-submit"
        :disabled="!codeComplete || pending"
        :aria-disabled="!codeComplete || pending"
      >
        {{ t('verifyEmail.submit') }}
      </button>
    </form>

    <p class="auth-flow-meta auth-flow-meta--row">
      <span>{{ t('verifyEmail.resendLead') }}</span>
      <button type="button" class="auth-text-btn" @click="onResend">
        {{ t('verifyEmail.resendAction') }}
      </button>
    </p>

    <p class="auth-flow-meta">
      <button type="button" class="auth-text-btn" @click="onLogout">
        {{ t('verifyEmail.logout') }}
      </button>
    </p>

    <template #below>
      <p class="auth-flow-hint">{{ t('verifyEmail.footerHint') }}</p>
    </template>
  </AuthFocusedLayout>
</template>
