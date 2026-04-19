import { stripLocalePrefix } from '../utils/strip-locale-prefix';

const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/about',
]);

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  const localePath = useLocalePath();
  const path = stripLocalePrefix(to.path);

  if (
    authStore.isAuthenticated &&
    (path === '/login' || path === '/register')
  ) {
    const { redirect } = to.query;
    return navigateTo(redirect?.toString() ?? '/app');
  }

  if (PUBLIC_PATHS.has(path)) return;

  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: localePath('/login'),
      query: { redirect: to.fullPath },
    });
  }
});
