const SIDEBAR_OPEN_KEY = 'app-sidebar-open';

export function useAppSidebar() {
  const open = useState(SIDEBAR_OPEN_KEY, () => false);

  function openSidebar() {
    open.value = true;
  }

  function closeSidebar() {
    open.value = false;
  }

  function toggleSidebar() {
    open.value = !open.value;
  }

  return {
    open,
    openSidebar,
    closeSidebar,
    toggleSidebar,
  };
}
