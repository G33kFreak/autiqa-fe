import { FetchError } from 'ofetch';
import { StatusCodes } from 'http-status-codes';
import type { ApiClient } from '~/api/types';

export const useApi = () => {
  const authStore = useAuthStore();

  const api = $fetch.create({
    baseURL: '/api',
    credentials: 'include',
  }) as ApiClient;

  const core = $fetch.create({
    baseURL: '/api',
    credentials: 'include',

    onRequest({ options }) {
      if (!authStore.accessToken) return;
      const headers = new Headers(options.headers as HeadersInit | undefined);
      headers.set('Authorization', `Bearer ${authStore.accessToken}`);
      options.headers = headers;
    },
  });

  const authenticatedApi = (async (request, options) => {
    try {
      return await core(request, options);
    } catch (error: unknown) {
      if (!(error instanceof FetchError)) throw error;
      if ((error.status ?? error.statusCode) !== StatusCodes.UNAUTHORIZED)
        throw error;

      const refreshed = await authStore.refresh();

      if (refreshed) {
        const headers = new Headers(
          options?.headers as HeadersInit | undefined,
        );
        headers.set('Authorization', `Bearer ${authStore.accessToken}`);
        return await $fetch(request, {
          ...options,
          baseURL: '/api',
          credentials: 'include',
          headers,
        });
      }

      await authStore.logout();
      throw error;
    }
  }) as typeof core;

  return { authenticatedApi, api };
};
