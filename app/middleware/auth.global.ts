const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/about',
]);

/** `/login` and `/en/login` → `/login` (same for other prefixed locales). */
function stripLocalePrefix(path: string): string {
  const { defaultLocale, locales } = useRuntimeConfig().public.i18n;
  for (const { code } of locales as { code: string }[]) {
    if (code === defaultLocale) continue;
    const prefix = `/${code}`;
    if (path === prefix) return '/';
    if (path.startsWith(`${prefix}/`)) return path.slice(prefix.length) || '/';
  }
  return path;
}

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  const localePath = useLocalePath();
  const path = stripLocalePrefix(to.path);

  if (authStore.isAuthenticated && (path === '/login' || path === '/register')) {
    return navigateTo('/app');
  }

  if (PUBLIC_PATHS.has(path)) return;

  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: localePath('/login'),
      query: { redirect: to.fullPath },
    });
  }
});
