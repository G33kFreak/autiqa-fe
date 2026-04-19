import { stripLocalePrefix } from '../utils/strip-locale-prefix';

const VERIFY_EMAIL_PATH = '/app/verify-email';

function isAppArea(path: string): boolean {
  return (
    path === VERIFY_EMAIL_PATH || path === '/app' || path.startsWith('/app/')
  );
}

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  const path = stripLocalePrefix(to.path);

  if (!isAppArea(path)) return;

  if (!authStore.isAuthenticated) return;

  if (authStore.user && !authStore.user.isActive) {
    if (path === VERIFY_EMAIL_PATH) return;
    return navigateTo(VERIFY_EMAIL_PATH);
  }

  if (authStore.user?.isActive && path === VERIFY_EMAIL_PATH) {
    return navigateTo('/app');
  }
});
