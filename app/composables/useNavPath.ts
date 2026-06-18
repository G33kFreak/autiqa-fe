export function useNavPath() {
  const localePath = useLocalePath()
  const { locale } = useI18n()
  const defaultLocale = 'pl'

  return (path: string): string => {
    const resolved = localePath(path)
    // localePath returns the raw path when the route isn't registered.
    // In that case, manually apply the locale prefix for non-default locales.
    if (resolved === path && locale.value !== defaultLocale) {
      return `/${locale.value}${path}`
    }
    return resolved
  }
}
