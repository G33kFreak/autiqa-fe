<script setup lang="ts">
import type { IconName } from './Icon.vue';

const { t } = useI18n();
const localePath = useLocalePath();
const { collapsed, mobileOpen, closeMobile } = useSidebar();

type NavItem = { key: string; to: string; icon: IconName };

const primary: NavItem[] = [
  { key: 'dashboard', to: '/app', icon: 'dashboard' },
  { key: 'fleet', to: '/app/fleet', icon: 'fleet' },
  { key: 'drivers', to: '/app/drivers', icon: 'drivers' },
  { key: 'finances', to: '/app/finances', icon: 'finances' },
];

const settings: NavItem = { key: 'settings', to: '/app/settings', icon: 'settings' };

/** Tooltip + native title only matter in the rail state. */
function railLabel(key: string) {
  return collapsed.value ? t(`app.nav.${key}`) : undefined;
}
</script>

<template>
  <aside
    class="sidebar"
    :class="{ 'sidebar--rail': collapsed, 'is-open': mobileOpen }"
  >
    <div class="sidebar__head">
      <NuxtLink :to="localePath('/app')" class="sidebar__brand" @click="closeMobile">
        <span class="sidebar__mark">
          <AutiqaLogo :size="24" class="sidebar__logo" />
        </span>
      </NuxtLink>
      <button
        type="button"
        class="sidebar__close"
        :aria-label="t('app.shell.closeMenu')"
        @click="closeMobile"
      >
        <AppIcon name="close" :size="20" />
      </button>
    </div>

    <nav class="sidebar__nav" :aria-label="t('app.nav.label')">
      <ul class="sidebar__list">
        <li v-for="item in primary" :key="item.key">
          <NuxtLink
            :to="localePath(item.to)"
            class="nav-item"
            :title="railLabel(item.key)"
            @click="closeMobile"
          >
            <span class="nav-item__icon"><AppIcon :name="item.icon" /></span>
            <span class="nav-item__label">{{ t(`app.nav.${item.key}`) }}</span>
            <span class="nav-item__tip" aria-hidden="true">{{ t(`app.nav.${item.key}`) }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div class="sidebar__foot">
      <NuxtLink
        :to="localePath(settings.to)"
        class="nav-item"
        :title="railLabel(settings.key)"
        @click="closeMobile"
      >
        <span class="nav-item__icon"><AppIcon :name="settings.icon" /></span>
        <span class="nav-item__label">{{ t('app.nav.settings') }}</span>
        <span class="nav-item__tip" aria-hidden="true">{{ t('app.nav.settings') }}</span>
      </NuxtLink>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  --sidebar-w: 250px;
  --rail-w: 76px;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: var(--sidebar-w);
  flex: 0 0 var(--sidebar-w);
  height: 100dvh;
  background: var(--color-surface);
  border-right: 1px solid var(--color-outline);
  transition: width var(--duration-ui) var(--ease-out),
    flex-basis var(--duration-ui) var(--ease-out);
  overflow: visible;
}

.sidebar--rail {
  width: var(--rail-w);
  flex-basis: var(--rail-w);
}

/* ── Head / brand ─────────────────────────────────────────── */
.sidebar__head {
  display: flex;
  align-items: center;
  height: 65px;
  flex: 0 0 65px;
  padding: 0 var(--space-5);
  border-bottom: 1px solid var(--color-outline);
}

.sidebar--rail .sidebar__head {
  padding: 0;
  justify-content: center;
}

.sidebar__brand {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  border-radius: var(--radius-md);
}

.sidebar__brand:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

.sidebar__mark {
  display: inline-flex;
}

/* In rail mode, AutiqaLogo's wordmark collapses away smoothly. */
.sidebar__logo {
  overflow: hidden;
}

.sidebar--rail .sidebar__logo :deep(.autiqa-logo__name) {
  max-width: 0;
  opacity: 0;
  margin-left: -0.5rem;
}

.sidebar__logo :deep(.autiqa-logo__name) {
  max-width: 8rem;
  overflow: hidden;
  white-space: nowrap;
  transition: max-width var(--duration-ui) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out),
    margin-left var(--duration-ui) var(--ease-out);
}

.sidebar__close {
  display: none;
  margin-left: auto;
  padding: var(--space-2);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-muted);
}

/* ── Nav ──────────────────────────────────────────────────── */
.sidebar__nav {
  flex: 1;
  min-height: 0;
  /* `visible` (not auto) so rail tooltips can escape the sidebar edge — a
     scroll container would clip them. Safe: the primary group never overflows. */
  overflow: visible;
  padding: var(--space-4) var(--space-3);
}

.sidebar__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar__foot {
  padding: var(--space-3) var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-outline);
}

/* ── Nav item ─────────────────────────────────────────────── */
.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  height: 42px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-muted);
  font-size: 0.9375rem;
  font-weight: 500;
  white-space: nowrap;
  transition: background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.nav-item:hover {
  background: var(--color-surface-mid);
  color: var(--color-ink);
}

.nav-item:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.nav-item.router-link-exact-active {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  font-weight: 600;
}

.nav-item__icon {
  display: inline-flex;
  flex: 0 0 22px;
  justify-content: center;
  color: inherit;
}

.nav-item__label {
  min-width: 0;
  overflow: hidden;
  opacity: 1;
  transform: translateX(0);
  transition: opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-ui) var(--ease-out);
}

.sidebar--rail .nav-item {
  gap: 0;
  padding: 0;
  justify-content: center;
}

.sidebar--rail .nav-item__label {
  opacity: 0;
  transform: translateX(-6px);
  width: 0;
  pointer-events: none;
}

/* ── Rail tooltip ─────────────────────────────────────────── */
.nav-item__tip {
  position: absolute;
  left: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%) translateX(-4px);
  padding: 0.3rem 0.6rem;
  background: var(--color-ink);
  color: var(--color-bg);
  font-size: 0.8125rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  box-shadow: var(--shadow-float);
  transition: opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
  z-index: var(--z-tooltip);
}

.sidebar--rail .nav-item:hover .nav-item__tip,
.sidebar--rail .nav-item:focus-visible .nav-item__tip {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}

/* Non-rail never shows tooltips. */
.sidebar:not(.sidebar--rail) .nav-item__tip {
  display: none;
}

/* ── Mobile drawer ────────────────────────────────────────── */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: var(--sidebar-w);
    flex-basis: var(--sidebar-w);
    transform: translateX(-100%);
    transition: transform var(--duration-ui) var(--ease-out);
    box-shadow: var(--shadow-float);
    z-index: var(--z-modal);
  }

  /* Mobile drawer always shows full labels, never the rail. */
  .sidebar--rail {
    width: var(--sidebar-w);
    flex-basis: var(--sidebar-w);
  }

  .sidebar--rail .nav-item {
    gap: var(--space-3);
    padding: 0 var(--space-3);
    justify-content: flex-start;
  }

  .sidebar--rail .nav-item__label {
    opacity: 1;
    transform: none;
    width: auto;
  }

  .sidebar--rail .sidebar__logo :deep(.autiqa-logo__name) {
    max-width: 8rem;
    opacity: 1;
    margin-left: 0;
  }

  .sidebar--rail .sidebar__head {
    padding: 0 var(--space-5);
    justify-content: flex-start;
  }

  .sidebar.is-open {
    transform: translateX(0);
  }

  .sidebar__close {
    display: inline-flex;
  }

  .nav-item__tip {
    display: none !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar,
  .sidebar__logo :deep(.autiqa-logo__name),
  .nav-item,
  .nav-item__label,
  .nav-item__tip {
    transition-duration: 0.01ms;
  }
}
</style>
