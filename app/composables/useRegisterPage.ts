import { FetchError } from 'ofetch';
import { StatusCodes } from 'http-status-codes';

export const REGISTER_PLUS_KEYS = ['freeTier', 'compliance', 'pln'] as const;

export function useRegisterPage() {
  const { t } = useI18n();
  const localePath = useLocalePath();
  const route = useRoute();
  const authStore = useAuthStore();

  const name = ref('');
  const email = ref('');
  const password = ref('');
  const passwordConfirm = ref('');
  const pending = ref(false);
  const formError = ref('');

  const pluses = computed(() =>
    REGISTER_PLUS_KEYS.map((key) => t(`register.pluses.${key}`)),
  );

  useSeoMeta({
    title: computed(() => t('meta.register.title')),
    description: computed(() => t('meta.register.description')),
  });

  function validate(): boolean {
    formError.value = '';
    const n = name.value.trim();
    const e = email.value.trim();
    const p = password.value;
    const c = passwordConfirm.value;

    if (!n) {
      formError.value = t('register.errors.nameRequired');
      return false;
    }
    if (!e) {
      formError.value = t('register.errors.emailRequired');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      formError.value = t('register.errors.emailInvalid');
      return false;
    }
    if (p.length < 8) {
      formError.value = t('register.errors.passwordShort');
      return false;
    }
    if (p !== c) {
      formError.value = t('register.errors.passwordMismatch');
      return false;
    }
    return true;
  }

  async function submit() {
    if (!validate()) return;

    pending.value = true;
    try {
      await authStore.register({
        name: name.value.trim(),
        email: email.value.trim(),
        password: password.value,
      });

      const q = route.query.redirect;
      const afterRegister =
        typeof q === 'string' && q.startsWith('/') && !q.startsWith('//')
          ? q
          : localePath('/app');
      await navigateTo(afterRegister, { replace: true });
    } catch (e: unknown) {
      const status = e instanceof FetchError ? (e.status ?? e.statusCode) : 0;
      if (status === StatusCodes.CONFLICT) {
        formError.value = t('register.errors.conflict');
      } else if (status === StatusCodes.BAD_REQUEST) {
        formError.value = t('register.errors.badRequest');
      } else {
        formError.value = t('register.errors.generic');
      }
    } finally {
      pending.value = false;
    }
  }

  return {
    name,
    email,
    password,
    passwordConfirm,
    pending,
    formError,
    pluses,
    submit,
  };
}
