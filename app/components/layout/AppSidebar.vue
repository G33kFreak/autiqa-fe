<script setup lang="ts">
import { APP_NAV_ITEMS, isNavActive } from '../../utils/app-nav';

const { t } = useI18n();
const route = useRoute();
const { open, closeSidebar, collapsed, toggleCollapsed } = useAppSidebar();

const isDesktop = ref(false);
if (import.meta.client) {
  isDesktop.value = window.matchMedia('(min-width: 768px)').matches;
}

onMounted(() => {
  if (!import.meta.client) {
    return;
  }
  const mq = window.matchMedia('(min-width: 768px)');
  const onMq = () => {
    isDesktop.value = mq.matches;
  };
  mq.addEventListener('change', onMq);
  onUnmounted(() => mq.removeEventListener('change', onMq));
});

const narrowNav = computed(() => collapsed.value && isDesktop.value);

function onNavClick() {
  if (import.meta.client && window.matchMedia('(max-width: 767px)').matches) {
    closeSidebar();
  }
}
</script>

<template>
  <aside
    class="app-sidebar"
    :class="{
      'app-sidebar--open': open,
      'app-sidebar--collapsed': narrowNav,
    }"
    :aria-label="t('layout.sidebar.mainNavigationAria')"
  >
    <div class="app-sidebar__brand">
      <div v-show="!narrowNav" class="app-sidebar__logo" aria-hidden="true">
        <span class="material-symbols-outlined app-sidebar__logo-icon">insights</span>
      </div>
      <div v-show="!narrowNav" class="app-sidebar__brand-text">
        <p class="app-sidebar__brand-name">{{ t('brand') }}</p>
      </div>
      <button
        type="button"
        class="app-sidebar__collapse"
        :aria-expanded="narrowNav ? 'false' : 'true'"
        :aria-label="narrowNav ? t('layout.sidebar.expandNav') : t('layout.sidebar.collapseNav')"
        @click="toggleCollapsed"
      >
        <span class="material-symbols-outlined app-sidebar__collapse-icon" aria-hidden="true">
          {{ narrowNav ? 'chevron_right' : 'chevron_left' }}
        </span>
      </button>
    </div>

    <nav class="app-sidebar__nav" :aria-label="t('layout.sidebar.appSectionsAria')">
      <NuxtLink
        v-for="item in APP_NAV_ITEMS"
        :key="item.to"
        :to="item.to"
        class="app-sidebar__link"
        :class="{
          'app-sidebar__link--active': isNavActive(route.path, item.to),
        }"
        :aria-current="isNavActive(route.path, item.to) ? 'page' : undefined"
        :aria-label="narrowNav ? t(item.i18nKey) : undefined"
        :title="narrowNav ? t(item.i18nKey) : undefined"
        @click="onNavClick"
      >
        <span
          class="material-symbols-outlined app-sidebar__link-icon"
          :class="{
            'app-sidebar__link-icon--filled': isNavActive(route.path, item.to),
          }"
          aria-hidden="true"
        >{{ item.icon }}</span>
        <span class="app-sidebar__link-label">{{ t(item.i18nKey) }}</span>
      </NuxtLink>
    </nav>

    <div v-show="!narrowNav" class="app-sidebar__footer" :aria-label="t('layout.sidebar.buildInfoAria')">
      <p class="app-sidebar__footer-copy">{{ t('layout.sidebar.copyright') }}</p>
      <p class="app-sidebar__footer-version">{{ t('layout.sidebar.alphaVersion') }}</p>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  width: 16rem;
  height: 100dvh;
  height: 100vh;
  background: var(--color-surface-container-low);
  transform: translateX(-100%);
  transition:
    transform 0.22s ease,
    width 0.22s ease;
}

.app-sidebar--open {
  transform: translateX(0);
}

@media (min-width: 768px) {
  .app-sidebar {
    transform: translateX(0);
  }

  .app-sidebar--collapsed {
    width: 4.5rem;
  }
}

.app-sidebar__collapse {
  display: none;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  margin-left: auto;
  padding: 0;
  border: none;
  border-radius: 0.625rem;
  background: color-mix(in srgb, var(--color-surface-container) 45%, transparent);
  color: var(--color-on-surface-variant);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

@media (min-width: 768px) {
  .app-sidebar__collapse {
    display: flex;
  }
}

.app-sidebar__collapse:hover {
  color: var(--color-on-surface);
  background: color-mix(in srgb, var(--color-surface-container) 65%, transparent);
}

.app-sidebar__collapse:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  outline-offset: 2px;
}

.app-sidebar__collapse-icon {
  font-size: 1.25rem;
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}

.app-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.75rem 1.25rem 1.25rem;
}

@media (min-width: 768px) {
  .app-sidebar__brand {
    padding: 1.25rem 1rem 1.25rem 1.25rem;
  }

  .app-sidebar--collapsed .app-sidebar__brand {
    justify-content: center;
    padding: 1rem 0.375rem;
  }

  .app-sidebar--collapsed .app-sidebar__collapse {
    width: 2.25rem;
    height: 2.25rem;
    margin-left: 0;
  }
}

.app-sidebar__logo {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--color-secondary) 0%,
    var(--color-secondary-container) 100%
  );
  box-shadow: var(--shadow-ambient);
}

.app-sidebar__logo-icon {
  font-size: 1.375rem;
  color: var(--color-on-secondary);
  font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}

.app-sidebar__brand-text {
  flex: 1;
  min-width: 0;
}

.app-sidebar__brand-name {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-on-surface);
  line-height: 1.2;
}

.app-sidebar__nav {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  scrollbar-width: thin;
}

@media (min-width: 768px) {
  .app-sidebar--collapsed .app-sidebar__nav {
    padding-left: 0.375rem;
    padding-right: 0.375rem;
  }
}

.app-sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0;
  border-right: 4px solid transparent;
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-on-surface-variant);
  text-decoration: none;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.app-sidebar__link:hover {
  color: var(--color-on-surface);
  background: color-mix(in srgb, var(--color-surface-container) 55%, transparent);
}

.app-sidebar__link--active {
  color: var(--color-secondary-container);
  font-weight: 700;
  border-right-color: var(--color-secondary-container);
  background: color-mix(in srgb, var(--color-on-surface) 7%, transparent);
}

.app-sidebar__link--active:hover {
  color: var(--color-secondary-container);
  background: color-mix(in srgb, var(--color-on-surface) 10%, transparent);
}

.app-sidebar__link-icon {
  font-size: 1.25rem;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.app-sidebar__link-icon--filled {
  font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}

.app-sidebar__link-label {
  min-width: 0;
}

@media (min-width: 768px) {
  .app-sidebar--collapsed .app-sidebar__link {
    position: relative;
    justify-content: center;
    padding-left: 0.375rem;
    padding-right: 0.375rem;
    gap: 0;
  }

  .app-sidebar--collapsed .app-sidebar__link-label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}

.app-sidebar__footer {
  padding: 0.85rem 1rem 1rem;
  color: color-mix(in srgb, var(--color-on-surface-variant) 65%, transparent);
}

.app-sidebar__footer-copy,
.app-sidebar__footer-version {
  margin: 0;
  font-size: 0.625rem;
  line-height: 1.35;
  letter-spacing: 0.02em;
}

.app-sidebar__footer-version {
  margin-top: 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
</style>
