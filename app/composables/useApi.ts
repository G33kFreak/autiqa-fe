import { FetchError } from 'ofetch';
import { StatusCodes } from 'http-status-codes';
import type { ApiClient } from '~/api/types';

export const useApi = () => {
  const authStore = useAuthStore();
  const raw = useRuntimeConfig().public.apiBase;
  const baseURL =
    typeof raw === 'string' && raw.length > 0 ? raw.replace(/\/$/, '') : '';
  const apiClientDefaults = {
    baseURL: baseURL || '/',
    credentials: 'include' as const,
  };

  const api = $fetch.create(apiClientDefaults) as ApiClient;

  /** Same-origin Nitro routes (`/api/*`), e.g. BFF proxies. */
  const nuxtApi = $fetch.create({
    baseURL: '/api',
    credentials: 'include',
  }) as ApiClient;

  const authenticatedCore = $fetch.create({
    ...apiClientDefaults,
    onRequest({ options }) {
      if (!authStore.accessToken) return;
      const headers = new Headers(options.headers as HeadersInit | undefined);
      headers.set('Authorization', `Bearer ${authStore.accessToken}`);
      options.headers = headers;
    },
  }) as ApiClient;

  const authenticatedApi = (async (request, options) => {
    try {
      return await authenticatedCore(request, options);
    } catch (error: unknown) {
      if (!(error instanceof FetchError)) throw error;
      if ((error.status ?? error.statusCode) !== StatusCodes.UNAUTHORIZED)
        throw error;

      const refreshed = await authStore.refresh();

      if (refreshed) {
        return await authenticatedCore(request, options);
      }

      await authStore.logout();
      throw error;
    }
  }) as typeof authenticatedCore;

  return { api, nuxtApi, authenticatedApi };
};
