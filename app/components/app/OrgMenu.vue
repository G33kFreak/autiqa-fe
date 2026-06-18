<script setup lang="ts">
const { t } = useI18n();
const authStore = useAuthStore();
const orgStore = useOrganizationStore();

/** Real organization name once loaded; a neutral workspace label until then. */
const orgName = computed(
  () => orgStore.organization?.name ?? t('app.workspaceFallback'),
);
const orgInitial = computed(() => orgName.value.trim().charAt(0).toUpperCase() || 'A');

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const loggingOut = ref(false);

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
}

function onPointerDown(event: PointerEvent) {
  if (root.value && !root.value.contains(event.target as Node)) close();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    close();
    (root.value?.querySelector('.org-menu__trigger') as HTMLElement | null)?.focus();
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown);
  document.removeEventListener('keydown', onKeydown);
});

async function onLogout() {
  if (loggingOut.value) return;
  loggingOut.value = true;
  try {
    await authStore.logout();
  } finally {
    loggingOut.value = false;
  }
}
</script>

<template>
  <div ref="root" class="org-menu">
    <button
      type="button"
      class="org-menu__trigger"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="toggle"
    >
      <span class="org-menu__avatar" aria-hidden="true">{{ orgInitial }}</span>
      <span class="org-menu__name">{{ orgName }}</span>
      <span class="org-menu__chevron" :class="{ 'is-open': open }">
        <AppIcon name="chevron" :size="18" />
      </span>
    </button>

    <Transition name="menu-pop">
      <div v-if="open" class="org-menu__panel" role="menu">
        <div class="org-menu__org">
          <span class="org-menu__avatar org-menu__avatar--lg" aria-hidden="true">{{ orgInitial }}</span>
          <span class="org-menu__org-name">{{ orgName }}</span>
        </div>

        <div v-if="authStore.user" class="org-menu__identity">
          <span class="org-menu__identity-name">{{ authStore.user.name }}</span>
          <span class="org-menu__identity-email">{{ authStore.user.email }}</span>
        </div>

        <div class="org-menu__sep" />

        <button
          type="button"
          class="org-menu__action"
          role="menuitem"
          :disabled="loggingOut"
          @click="onLogout"
        >
          <AppIcon name="logout" :size="18" />
          <span>{{ t('app.logout') }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.org-menu {
  position: relative;
}

.org-menu__trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 40px;
  padding: 0 var(--space-2) 0 var(--space-2);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--color-ink);
  transition: background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.org-menu__trigger:hover {
  background: var(--color-surface-mid);
}

.org-menu__trigger[aria-expanded='true'] {
  background: var(--color-surface-mid);
  border-color: var(--color-outline);
}

.org-menu__trigger:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.org-menu__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  font-weight: 600;
}

.org-menu__name {
  max-width: 11rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9375rem;
  font-weight: 500;
}

.org-menu__chevron {
  display: inline-flex;
  color: var(--color-muted);
  transition: transform var(--duration-ui) var(--ease-out);
}

.org-menu__chevron.is-open {
  transform: rotate(180deg);
}

/* ── Panel ────────────────────────────────────────────────── */
.org-menu__panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 256px;
  padding: var(--space-3);
  background: var(--color-bg);
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-float);
  z-index: var(--z-dropdown);
}

.org-menu__org {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-2) var(--space-3);
}

.org-menu__avatar--lg {
  flex-basis: 36px;
  width: 36px;
  height: 36px;
  font-size: 0.9375rem;
  border-radius: var(--radius-md);
}

.org-menu__org-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--color-ink);
}

.org-menu__identity {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0 var(--space-2) var(--space-1);
}

.org-menu__identity-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-ink);
}

.org-menu__identity-email {
  font-size: 0.8125rem;
  color: var(--color-muted);
  overflow: hidden;
  text-overflow: ellipsis;
}

.org-menu__sep {
  height: 1px;
  margin: var(--space-2) 0;
  background: var(--color-outline);
}

.org-menu__action {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2) var(--space-2);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-ink);
  font-size: 0.9375rem;
  font-weight: 500;
  text-align: left;
  transition: background-color var(--duration-fast) var(--ease-out);
}

.org-menu__action:hover:not(:disabled) {
  background: var(--color-surface-mid);
}

.org-menu__action:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.org-menu__action:disabled {
  opacity: 0.6;
  cursor: progress;
}

/* ── Pop transition ───────────────────────────────────────── */
.menu-pop-enter-active {
  transition: opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.menu-pop-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.menu-pop-enter-from,
.menu-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

@media (max-width: 768px) {
  .org-menu__name {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .org-menu__chevron,
  .menu-pop-enter-active,
  .menu-pop-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
