import { stripLocalePrefix } from '../utils/strip-locale-prefix';

const VERIFY_EMAIL_PATH = '/verify-email';

/** True for the authenticated app area that requires an active account. */
function isAppArea(path: string): boolean {
  return path === '/app' || path.startsWith('/app/');
}

/**
 * Keeps a signed-in but unverified user (`isActive === false`) on the OTP
 * screen until they confirm their email, and bounces a verified user off it.
 *
 * Runs after `01.auth` (which guarantees a session for protected routes) and
 * client-only, because the access token — and therefore `user` — is restored
 * in the browser by `auth.client.ts`.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const authStore = useAuthStore();
  if (!authStore.isAuthenticated || !authStore.user) return;

  const localePath = useLocalePath();
  const path = stripLocalePrefix(to.path);
  const isActive = authStore.user.isActive;

  if (!isActive && isAppArea(path)) {
    return navigateTo(localePath(VERIFY_EMAIL_PATH));
  }

  if (isActive && path === VERIFY_EMAIL_PATH) {
    return navigateTo(localePath('/app'));
  }
});
