/** `/login` and `/en/login` → `/login` (same for other prefixed locales). */
export function stripLocalePrefix(path: string): string {
  const { defaultLocale, locales } = useRuntimeConfig().public.i18n;
  for (const { code } of locales as { code: string }[]) {
    if (code === defaultLocale) continue;
    const prefix = `/${code}`;
    if (path === prefix) return '/';
    if (path.startsWith(`${prefix}/`)) return path.slice(prefix.length) || '/';
  }
  return path;
}
