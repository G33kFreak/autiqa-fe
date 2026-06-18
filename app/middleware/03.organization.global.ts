import { stripLocalePrefix } from '../utils/strip-locale-prefix';

const ONBOARDING_PATH = '/onboarding-org';
const VERIFY_EMAIL_PATH = '/verify-email';

/** True for the authenticated app area that requires an organization. */
function isAppArea(path: string): boolean {
  return path === '/app' || path.startsWith('/app/');
}

/**
 * Gates `/app/**` on the signed-in user having created an organization, and
 * keeps an org-less user on the onboarding screen until they do.
 *
 * Runs after `01.auth` (guarantees a session) and `02.verify-email` (guarantees
 * an active account), and client-only — the access token, and therefore the
 * org request's Bearer header, only exist in the browser.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const authStore = useAuthStore();
  if (!authStore.isAuthenticated || !authStore.user) return;

  const localePath = useLocalePath();
  const path = stripLocalePrefix(to.path);

  // An unverified user must finish email verification before naming a workspace.
  if (!authStore.user.isActive) {
    if (path === ONBOARDING_PATH) {
      return navigateTo(localePath(VERIFY_EMAIL_PATH));
    }
    return;
  }

  const orgStore = useOrganizationStore();
  try {
    await orgStore.ensureLoaded();
  } catch {
    // Transient failure — don't trap the user on onboarding; retry next nav.
    return;
  }

  if (!orgStore.hasOrganization && isAppArea(path)) {
    return navigateTo(localePath(ONBOARDING_PATH));
  }

  if (orgStore.hasOrganization && path === ONBOARDING_PATH) {
    return navigateTo(localePath('/app'));
  }
});
