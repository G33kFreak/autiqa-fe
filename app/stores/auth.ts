import { defineStore } from 'pinia';
import type { RegisterDto } from '#shared/dto/register.dto';
import type { RegisterResponseDto } from '#shared/dto/register-response.dto';
import type { UserDto } from '#shared/dto/user.dto';
import {
  login as loginRequest,
  logoutSession,
  registerAccount,
  refreshSession as refreshSessionRequest,
  verifyEmail as verifyEmailRequest,
} from '../api/auth';
import { getMe } from '../api/users';

export const useAuthStore = defineStore('auth', () => {
  const { nuxtApi, authenticatedApi } = useApi();
  const user = ref<UserDto | null>(null);
  const accessToken = ref<string | null>(null);
  const isRefreshing = ref(false);
  /** In-flight refresh; reused so parallel 401s do not spawn multiple refresh calls */
  const refreshPromise = ref<Promise<boolean> | null>(null);

  const isAuthenticated = computed(() => !!accessToken.value);
  const getAccessToken = computed(() => accessToken.value);

  async function login(email: string, password: string) {
    const data = await loginRequest(nuxtApi, { email, password });
    accessToken.value = data.accessToken;
    user.value = data.user;
  }

  async function register(payload: RegisterDto): Promise<RegisterResponseDto> {
    const data = await registerAccount(nuxtApi, payload);
    accessToken.value = data.tokens.accessToken;
    user.value = data.user;
    return data;
  }

  async function logout() {
    try {
      await logoutSession(nuxtApi);
    } finally {
      accessToken.value = null;
      user.value = null;
      refreshPromise.value = null;
      await navigateTo('/login');
    }
  }

  async function initAuth(): Promise<boolean> {
    if (accessToken.value) return true;
    return refresh();
  }

  async function fetchUser() {
    user.value = await getMe(authenticatedApi);
  }

  async function verifyEmail(code: string) {
    await verifyEmailRequest(authenticatedApi, { otpCode: code });
    await fetchUser();
  }

  async function refresh(): Promise<boolean> {
    if (refreshPromise.value !== null) {
      return refreshPromise.value;
    }

    const performRefresh = async () => {
      const tokens = await refreshSessionRequest(nuxtApi);
      accessToken.value = tokens.accessToken;
      await fetchUser();
    };

    isRefreshing.value = true;

    const promise = performRefresh()
      .then(() => {
        return true;
      })
      .catch(() => {
        accessToken.value = null;
        user.value = null;
        return false;
      })
      .finally(() => {
        isRefreshing.value = false;
        refreshPromise.value = null;
      });

    refreshPromise.value = promise;
    return promise;
  }

  return {
    user,
    accessToken,
    isRefreshing,
    refreshPromise,
    isAuthenticated,
    getAccessToken,
    login,
    register,
    logout,
    initAuth,
    refresh,
    fetchUser,
    verifyEmail,
  };
});
