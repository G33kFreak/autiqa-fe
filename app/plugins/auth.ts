export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  // Silently restore session from refresh token cookie
  // This runs on every page load/refresh before any route guard
  await authStore.initAuth();
});
