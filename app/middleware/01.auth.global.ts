import { stripLocalePrefix } from '../utils/strip-locale-prefix';

/** Routes reachable without a session. Everything else requires auth. */
const PUBLIC_PATHS = new Set(['/', '/login', '/register', '/forgot-password']);

/** Auth pages an already-signed-in user should be bounced away from. */
const AUTH_PATHS = new Set(['/login', '/register', '/forgot-password']);

export default defineNuxtRouteMiddleware((to) => {
  // The access token is in-memory only and restored client-side by
  // `auth.client.ts`, so guarding on the server would always redirect.
  if (import.meta.server) return;

  const authStore = useAuthStore();
  const localePath = useLocalePath();
  const path = stripLocalePrefix(to.path);

  if (authStore.isAuthenticated && AUTH_PATHS.has(path)) {
    const { redirect } = to.query;
    return navigateTo(redirect?.toString() ?? localePath('/app'));
  }

  if (PUBLIC_PATHS.has(path)) return;

  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: localePath('/login'),
      query: { redirect: to.fullPath },
    });
  }
});
