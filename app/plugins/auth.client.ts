/**
 * Restore the session once, before route middleware runs, so a hard refresh of
 * an `/app` page keeps the user logged in (token lives in memory only; the
 * refresh token is an httpOnly cookie read by the BFF). Client-only because the
 * access token is never available during SSR.
 */
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  await authStore.initAuth();
});
