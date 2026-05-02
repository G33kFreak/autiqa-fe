/** Sidebar targets under `/app` (no locale prefix). */
export const APP_NAV_ITEMS = [
  { to: '/app', i18nKey: 'nav.dashboard', icon: 'dashboard' },
  { to: '/app/fleet', i18nKey: 'nav.fleet', icon: 'local_shipping' },
  { to: '/app/finance', i18nKey: 'nav.finance', icon: 'payments' },
  { to: '/app/drivers', i18nKey: 'nav.drivers', icon: 'badge' },
  { to: '/app/settings', i18nKey: 'nav.settings', icon: 'settings' },
] as const;

export type AppNavItem = (typeof APP_NAV_ITEMS)[number];

export function isNavActive(routePath: string, itemTo: string): boolean {
  if (itemTo === '/app') {
    return routePath === '/app' || routePath === '/app/';
  }
  return routePath === itemTo || routePath.startsWith(`${itemTo}/`);
}
