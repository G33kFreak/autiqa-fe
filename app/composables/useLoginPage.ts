import { FetchError } from 'ofetch';
import { StatusCodes } from 'http-status-codes';

/** Stable order; each key maps to `login.pluses.<key>` in locale files. */
export const LOGIN_PLUS_KEYS = [
  'liveMap',
  'kpis',
  'roles',
  'margins',
] as const;

export function useLoginPage() {
  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();

  const email = ref('');
  const password = ref('');
  const pending = ref(false);
  const formError = ref('');
  const passwordResetBanner = ref(false);
  const showAuthLoader = ref(!authStore.getIsInitialized);

  const pluses = computed(() =>
    LOGIN_PLUS_KEYS.map((key) => t(`login.pluses.${key}`)),
  );

  onMounted(async () => {
    if (route.query.reset === '1') {
      passwordResetBanner.value = true;
      const q = { ...route.query };
      delete q.reset;
      await router.replace({ path: route.path, query: q });
    }

    if (authStore.getIsInitialized) return;

    const isAuthenticated = await authStore.initAuth();
    if (!isAuthenticated) {
      showAuthLoader.value = false;
      return;
    }

    const { redirect } = route.query;
    navigateTo(redirect?.toString() ?? '/app');
  });

  useSeoMeta({
    title: computed(() => t('meta.login.title')),
    description: computed(() => t('meta.login.description')),
  });

  async function submit() {
    formError.value = '';
    const trimmedEmail = email.value.trim();
    if (!trimmedEmail || !password.value) {
      formError.value = t('login.errors.required');
      return;
    }

    pending.value = true;
    try {
      await authStore.login(trimmedEmail, password.value);

      const q = route.query.redirect;
      const afterLogin =
        typeof q === 'string' && q.startsWith('/') && !q.startsWith('//')
          ? q
          : '/app';
      await navigateTo(afterLogin);
    } catch (e: unknown) {
      const status = e instanceof FetchError ? (e.status ?? e.statusCode) : 0;
      formError.value =
        status === StatusCodes.UNAUTHORIZED || status === StatusCodes.FORBIDDEN
          ? t('login.errors.invalid')
          : t('login.errors.generic');
    } finally {
      pending.value = false;
    }
  }

  return {
    email,
    password,
    pending,
    formError,
    passwordResetBanner,
    showAuthLoader,
    pluses,
    submit,
  };
}
