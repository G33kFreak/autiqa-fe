import { FetchError } from 'ofetch';
import { StatusCodes } from 'http-status-codes';
import {
  requestForgotPassword,
  resetPasswordWithCode,
} from '~/api/auth';
import {
  clearResetPasswordTokenFromStorage,
  readResetPasswordTokenFromStorage,
  writeResetPasswordTokenToStorage,
} from '~/utils/reset-password-token-storage';

export const RESET_PASSWORD_PLUS_KEYS = ['otp', 'window', 'login'] as const;
const RESEND_COOLDOWN_SEC = 60;

export function useResetPasswordPage() {
  const { t } = useI18n();
  const localePath = useLocalePath();
  const route = useRoute();
  const router = useRouter();
  const { nuxtApi } = useApi();

  const ready = ref(false);
  const resetToken = ref('');

  const code = ref('');
  const newPassword = ref('');
  const newPasswordConfirm = ref('');

  const pending = ref(false);
  const formError = ref('');

  const resendPending = ref(false);
  const resendCooldown = ref(0);
  let cooldownTimer: ReturnType<typeof setInterval> | null = null;

  const pluses = computed(() =>
    RESET_PASSWORD_PLUS_KEYS.map((key) => t(`resetPassword.pluses.${key}`)),
  );

  useSeoMeta({
    title: computed(() => t('meta.resetPassword.title')),
    description: computed(() => t('meta.resetPassword.description')),
  });

  function upstreamMessage(data: unknown): string {
    if (!data || typeof data !== 'object') return '';
    const m = (data as { message?: unknown }).message;
    if (typeof m === 'string') return m;
    if (Array.isArray(m) && typeof m[0] === 'string') return m[0];
    return '';
  }

  function mapResendError(e: unknown): string {
    if (!(e instanceof FetchError)) return t('resetPassword.errors.generic');
    const status = e.status ?? e.statusCode ?? 0;
    if (status === StatusCodes.TOO_MANY_REQUESTS)
      return t('resetPassword.errors.rateLimit');
    if (status === StatusCodes.BAD_REQUEST) {
      const raw = upstreamMessage(e.data);
      if (raw) return raw;
      return t('resetPassword.errors.generic');
    }
    return t('resetPassword.errors.generic');
  }

  function mapResetError(e: unknown): string {
    if (!(e instanceof FetchError)) return t('resetPassword.errors.generic');
    const status = e.status ?? e.statusCode ?? 0;
    if (status === StatusCodes.TOO_MANY_REQUESTS)
      return t('resetPassword.errors.rateLimitReset');
    if (status === StatusCodes.BAD_REQUEST) {
      const raw = upstreamMessage(e.data);
      const msg = raw.toLowerCase();
      if (msg.includes('differ'))
        return t('resetPassword.errors.samePassword');
      if (
        msg.includes('invalid') ||
        msg.includes('expired') ||
        msg.includes('reset code')
      )
        return t('resetPassword.errors.invalidCode');
      if (raw) return raw;
      return t('resetPassword.errors.badRequestReset');
    }
    return t('resetPassword.errors.generic');
  }

  function startResendCooldown() {
    if (cooldownTimer) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
    resendCooldown.value = RESEND_COOLDOWN_SEC;
    cooldownTimer = setInterval(() => {
      resendCooldown.value -= 1;
      if (resendCooldown.value <= 0 && cooldownTimer) {
        clearInterval(cooldownTimer);
        cooldownTimer = null;
        resendCooldown.value = 0;
      }
    }, 1000);
  }

  function applyTokenUpdate(token: string) {
    resetToken.value = token;
    writeResetPasswordTokenToStorage(token);
    void router.replace({
      path: route.path,
      query: { ...route.query, token },
    });
  }

  onMounted(async () => {
    const q = route.query.token;
    const fromQuery = typeof q === 'string' && q.length > 0 ? q : '';
    const fromStorage = readResetPasswordTokenFromStorage() ?? '';
    const token = fromQuery || fromStorage;
    if (!token) {
      await navigateTo(localePath('/forgot-password'));
      return;
    }
    resetToken.value = token;
    writeResetPasswordTokenToStorage(token);
    if (!fromQuery && fromStorage) {
      await router.replace({
        path: route.path,
        query: { ...route.query, token: fromStorage },
      });
    }
    startResendCooldown();
    ready.value = true;
  });

  onUnmounted(() => {
    if (cooldownTimer) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  });

  async function resend() {
    if (resendCooldown.value > 0 || resendPending.value || !resetToken.value)
      return;
    formError.value = '';
    resendPending.value = true;
    try {
      const { resetRequestToken } = await requestForgotPassword(nuxtApi, {
        resetRequestToken: resetToken.value,
      });
      applyTokenUpdate(resetRequestToken);
      startResendCooldown();
    } catch (e: unknown) {
      formError.value = mapResendError(e);
    } finally {
      resendPending.value = false;
    }
  }

  function onCodeInput(e: Event) {
    const el = e.target as HTMLInputElement;
    code.value = el.value.replace(/\D/g, '').slice(0, 6);
  }

  async function submit() {
    formError.value = '';
    const c = code.value.trim();
    const p = newPassword.value;
    const pc = newPasswordConfirm.value;

    if (c.length !== 6) {
      formError.value = t('resetPassword.errors.codeLength');
      return;
    }
    if (p.length < 8) {
      formError.value = t('resetPassword.errors.passwordShort');
      return;
    }
    if (p !== pc) {
      formError.value = t('resetPassword.errors.passwordMismatch');
      return;
    }
    if (!resetToken.value) {
      formError.value = t('resetPassword.errors.generic');
      return;
    }

    pending.value = true;
    try {
      await resetPasswordWithCode(nuxtApi, {
        resetRequestToken: resetToken.value,
        code: c,
        newPassword: p,
      });
      clearResetPasswordTokenFromStorage();
      await navigateTo({
        path: localePath('/login'),
        query: { reset: '1' },
      });
    } catch (e: unknown) {
      formError.value = mapResetError(e);
    } finally {
      pending.value = false;
    }
  }

  function goForgotDifferentEmail() {
    clearResetPasswordTokenFromStorage();
    void navigateTo(localePath('/forgot-password'));
  }

  const resendDisabled = computed(
    () => pending.value || resendPending.value || !resetToken.value,
  );

  return {
    ready,
    code,
    newPassword,
    newPasswordConfirm,
    pending,
    formError,
    resendPending,
    resendCooldown,
    resendDisabled,
    pluses,
    onCodeInput,
    resend,
    submit,
    goForgotDifferentEmail,
  };
}
