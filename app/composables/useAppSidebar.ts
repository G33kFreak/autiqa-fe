const SIDEBAR_OPEN_KEY = 'app-sidebar-open';
const SIDEBAR_COLLAPSED_KEY = 'app-sidebar-collapsed';
const SIDEBAR_COLLAPSED_STORAGE = 'app-sidebar-collapsed-pref';

export function useAppSidebar() {
  const open = useState(SIDEBAR_OPEN_KEY, () => false);
  const collapsed = useState(SIDEBAR_COLLAPSED_KEY, () => false);

  if (import.meta.client) {
    onMounted(() => {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE);
      if (stored === '1') {
        collapsed.value = true;
      }
    });

    watch(collapsed, (v) => {
      localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE, v ? '1' : '0');
    });
  }

  function openSidebar() {
    open.value = true;
  }

  function closeSidebar() {
    open.value = false;
  }

  function toggleSidebar() {
    open.value = !open.value;
  }

  function toggleCollapsed() {
    collapsed.value = !collapsed.value;
  }

  return {
    open,
    collapsed,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    toggleCollapsed,
  };
}
