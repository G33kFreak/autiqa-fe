const STORAGE_KEY = 'autiqa.sidebar.collapsed';

/**
 * Shared app-shell sidebar state.
 *
 * - `collapsed` drives the desktop rail (icons-only) vs expanded state and is
 *   persisted to localStorage. Defaults to expanded on the server so the markup
 *   matches first paint; the stored preference is applied after mount to avoid
 *   a hydration mismatch.
 * - `mobileOpen` drives the off-canvas drawer on narrow viewports.
 */
export function useSidebar() {
  const collapsed = useState('sidebar-collapsed', () => false);
  const mobileOpen = useState('sidebar-mobile-open', () => false);

  function restore() {
    if (import.meta.server) return;
    collapsed.value = localStorage.getItem(STORAGE_KEY) === '1';
  }

  function toggleCollapsed() {
    collapsed.value = !collapsed.value;
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, collapsed.value ? '1' : '0');
    }
  }

  function openMobile() {
    mobileOpen.value = true;
  }

  function closeMobile() {
    mobileOpen.value = false;
  }

  return {
    collapsed,
    mobileOpen,
    restore,
    toggleCollapsed,
    openMobile,
    closeMobile,
  };
}
