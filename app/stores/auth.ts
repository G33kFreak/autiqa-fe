import { defineStore } from 'pinia';
import {
  login as loginRequest,
  logoutSession,
  refreshSession as refreshSessionRequest,
} from '../api/auth';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export const useAuthStore = defineStore('auth', () => {
  const { api } = useApi();
  const user = ref<AuthUser | null>(null);
  const accessToken = ref<string | null>(null);
  const isRefreshing = ref(false);
  /** In-flight refresh; reused so parallel 401s do not spawn multiple refresh calls */
  const refreshPromise = ref<Promise<boolean> | null>(null);

  const isAuthenticated = computed(() => !!accessToken.value);
  const getAccessToken = computed(() => accessToken.value);

  async function login(email: string, password: string) {
    const data = await loginRequest(api, { email, password });
    accessToken.value = data.accessToken;
    user.value = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
    };
  }

  async function logout() {
    try {
      await logoutSession(api);
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

  async function refresh(): Promise<boolean> {
    if (refreshPromise.value !== null) {
      return refreshPromise.value;
    }

    isRefreshing.value = true;

    const promise = refreshSessionRequest(api)
      .then((data) => {
        accessToken.value = data.accessToken;
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
    logout,
    initAuth,
    refresh,
  };
});
