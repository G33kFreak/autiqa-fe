import { FetchError } from 'ofetch';
import { StatusCodes } from 'http-status-codes';
import { requestForgotPassword } from '~/api/auth';
import {
  clearResetPasswordTokenFromStorage,
  writeResetPasswordTokenToStorage,
} from '~/utils/reset-password-token-storage';

export const FORGOT_PASSWORD_PLUS_KEYS = ['otp', 'window', 'login'] as const;

export function useForgotPasswordPage() {
  const { t } = useI18n();
  const localePath = useLocalePath();
  const { nuxtApi } = useApi();

  const email = ref('');
  const pending = ref(false);
  const formError = ref('');

  const pluses = computed(() =>
    FORGOT_PASSWORD_PLUS_KEYS.map((key) => t(`forgotPassword.pluses.${key}`)),
  );

  onMounted(() => {
    clearResetPasswordTokenFromStorage();
  });

  useSeoMeta({
    title: computed(() => t('meta.forgotPassword.title')),
    description: computed(() => t('meta.forgotPassword.description')),
  });

  function upstreamMessage(data: unknown): string {
    if (!data || typeof data !== 'object') return '';
    const m = (data as { message?: unknown }).message;
    if (typeof m === 'string') return m;
    if (Array.isArray(m) && typeof m[0] === 'string') return m[0];
    return '';
  }

  function mapForgotError(e: unknown): string {
    if (!(e instanceof FetchError)) return t('forgotPassword.errors.generic');
    const status = e.status ?? e.statusCode ?? 0;
    if (status === StatusCodes.TOO_MANY_REQUESTS)
      return t('forgotPassword.errors.rateLimit');
    if (status === StatusCodes.BAD_REQUEST) {
      const raw = upstreamMessage(e.data);
      if (raw) return raw;
      return t('forgotPassword.errors.badRequest');
    }
    return t('forgotPassword.errors.generic');
  }

  async function submit() {
    formError.value = '';
    const trimmed = email.value.trim();
    if (!trimmed) {
      formError.value = t('forgotPassword.errors.emailRequired');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      formError.value = t('forgotPassword.errors.emailInvalid');
      return;
    }

    pending.value = true;
    try {
      const { resetRequestToken } = await requestForgotPassword(nuxtApi, {
        email: trimmed,
      });
      writeResetPasswordTokenToStorage(resetRequestToken);
      await navigateTo({
        path: localePath('/reset-password'),
        query: { token: resetRequestToken },
      });
    } catch (e: unknown) {
      formError.value = mapForgotError(e);
    } finally {
      pending.value = false;
    }
  }

  return {
    email,
    pending,
    formError,
    pluses,
    submit,
  };
}
