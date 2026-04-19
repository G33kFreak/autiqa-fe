import { stripLocalePrefix } from '../utils/strip-locale-prefix';

const ONBOARDING_ORG_PATH = '/app/onboarding-org';

function isAppArea(path: string): boolean {
  return path === '/app' || path.startsWith('/app/');
}

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();
  const orgStore = useOrganizationStore();
  const localePath = useLocalePath();
  const path = stripLocalePrefix(to.path);

  if (!isAppArea(path)) return;

  if (!authStore.isAuthenticated) return;

  if (!authStore.user?.isActive) return;

  if (path === ONBOARDING_ORG_PATH) return;

  await orgStore.getViewModel();

  if (!orgStore.hasOrganization) {
    return navigateTo(localePath(ONBOARDING_ORG_PATH));
  }
});
