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
  resendVerification as resendVerificationRequest,
} from '../api/auth';
import { getMe } from '../api/users';

export const useAuthStore = defineStore('auth', () => {
  const { nuxtApi, authenticatedApi } = useApi();

  /** In-memory only — never persisted to localStorage/cookies. */
  const accessToken = ref<string | null>(null);
  const user = ref<UserDto | null>(null);
  const isRefreshing = ref(false);
  /** Becomes true after the first session-restore attempt completes. */
  const isInitialized = ref(false);
  /** In-flight refresh; reused so parallel 401s do not spawn multiple refresh calls. */
  const refreshPromise = ref<Promise<boolean> | null>(null);

  const isAuthenticated = computed(() => !!accessToken.value);

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

  async function fetchUser() {
    user.value = await getMe(authenticatedApi);
  }

  /** Confirm the email OTP, then refresh `user` so `isActive` reflects the change. */
  async function verifyEmail(otpCode: string) {
    await verifyEmailRequest(authenticatedApi, { otpCode });
    await fetchUser();
  }

  /** Ask the API to send a fresh OTP to the signed-in user's email. */
  async function resendVerification() {
    await resendVerificationRequest(authenticatedApi);
  }

  /**
   * Restore a session on app boot from the httpOnly refresh cookie.
   * Resolves to whether the user ended up authenticated.
   */
  async function initAuth(): Promise<boolean> {
    if (accessToken.value) {
      isInitialized.value = true;
      return true;
    }
    return refresh().finally(() => (isInitialized.value = true));
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
      .then(() => true)
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
    isInitialized,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
    verifyEmail,
    resendVerification,
    initAuth,
    refresh,
  };
});
