<script setup lang="ts">
import { stripLocalePrefix } from '~/utils/strip-locale-prefix';

const { t } = useI18n();
const route = useRoute();
const {
  collapsed,
  mobileOpen,
  restore,
  toggleCollapsed,
  openMobile,
  closeMobile,
} = useSidebar();

/** Apply the persisted collapse preference once we're on the client. */
onMounted(restore);

const sectionKeys = ['fleet', 'drivers', 'finances', 'settings'] as const;

const sectionKey = computed(() => {
  const path = stripLocalePrefix(route.path).replace(/\/+$/, '') || '/app';
  const segment = path.split('/')[2] ?? '';
  return (sectionKeys as readonly string[]).includes(segment) ? segment : 'dashboard';
});

const sectionTitle = computed(() => t(`app.nav.${sectionKey.value}`));

/** Close the mobile drawer whenever the route changes. */
watch(() => route.fullPath, closeMobile);
</script>

<template>
  <div class="shell" :class="{ 'shell--rail': collapsed }">
    <AppSidebar />

    <Transition name="backdrop">
      <button
        v-if="mobileOpen"
        type="button"
        class="shell__backdrop"
        :aria-label="t('app.shell.closeMenu')"
        @click="closeMobile"
      />
    </Transition>

    <div class="shell__main">
      <header class="topbar">
        <div class="topbar__left">
          <button
            type="button"
            class="topbar__toggle topbar__toggle--desktop"
            :aria-label="collapsed ? t('app.shell.expand') : t('app.shell.collapse')"
            :aria-expanded="!collapsed"
            @click="toggleCollapsed"
          >
            <AppIcon name="panel" :size="20" />
          </button>
          <button
            type="button"
            class="topbar__toggle topbar__toggle--mobile"
            :aria-label="t('app.shell.openMenu')"
            @click="openMobile"
          >
            <AppIcon name="menu" :size="22" />
          </button>
          <span class="topbar__title">{{ sectionTitle }}</span>
        </div>

        <div class="topbar__right">
          <AppOrgMenu />
        </div>
      </header>

      <main class="shell__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  /* Lock the frame to the viewport so the sidebar + topbar stay put;
     only .shell__content scrolls (see below). */
  height: 100dvh;
  overflow: hidden;
  background: var(--color-bg);
}

.shell__main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  /* Let the content track shrink below its intrinsic height so it — not the
     page — owns the scroll. Without this, flex children refuse to shrink. */
  min-height: 0;
}

/* ── Top bar ──────────────────────────────────────────────── */
.topbar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  height: 65px;
  flex: 0 0 65px;
  padding: 0 var(--space-6);
  background: oklch(1 0 0 / 0.82);
  backdrop-filter: saturate(1.4) blur(10px);
  border-bottom: 1px solid var(--color-outline);
}

.topbar__left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.topbar__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-muted);
  transition: background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.topbar__toggle:hover {
  background: var(--color-surface-mid);
  color: var(--color-ink);
}

.topbar__toggle:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.topbar__toggle--mobile {
  display: none;
}

.topbar__title {
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar__right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* ── Content ──────────────────────────────────────────────── */
.shell__content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-10) var(--space-8);
}

/* ── Mobile backdrop ──────────────────────────────────────── */
.shell__backdrop {
  display: none;
}

@media (max-width: 768px) {
  .topbar {
    padding: 0 var(--space-4);
  }

  .topbar__toggle--desktop {
    display: none;
  }

  .topbar__toggle--mobile {
    display: inline-flex;
  }

  .shell__content {
    padding: var(--space-6) var(--space-4);
  }

  .shell__backdrop {
    display: block;
    position: fixed;
    inset: 0;
    border: none;
    background: oklch(0.155 0.018 268 / 0.45);
    z-index: var(--z-modal-backdrop, 350);
  }
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity var(--duration-ui) var(--ease-out);
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .topbar {
    backdrop-filter: none;
  }

  .backdrop-enter-active,
  .backdrop-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
