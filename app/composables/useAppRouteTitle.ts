import { APP_NAV_ITEMS, isNavActive } from '~/utils/app-nav';

/**
 * Presentation-only: maps current route to sidebar nav label for the header.
 */
export function useAppRouteTitle() {
  const { t } = useI18n();
  const route = useRoute();

  const title = computed(() => {
    const path = route.path;
    const match = APP_NAV_ITEMS.find((item) => isNavActive(path, item.to));
    if (match) {
      return t(match.i18nKey);
    }
    if (path.includes('/fleet/')) {
      return t('nav.fleet');
    }
    if (path.includes('/drivers/')) {
      return t('nav.drivers');
    }
    return t('layout.appTagline');
  });

  return { title };
}
