<script setup lang="ts">
import { APP_NAV_ITEMS, isNavActive } from '../../utils/app-nav';

const { t } = useI18n();
const route = useRoute();
const { open, closeSidebar } = useAppSidebar();

function onNavClick() {
  if (import.meta.client && window.matchMedia('(max-width: 767px)').matches) {
    closeSidebar();
  }
}
</script>

<template>
  <aside
    class="app-sidebar"
    :class="{ 'app-sidebar--open': open }"
    aria-label="Main navigation"
  >
    <div class="app-sidebar__brand">
      <div class="app-sidebar__logo" aria-hidden="true">
        <span class="material-symbols-outlined app-sidebar__logo-icon">insights</span>
      </div>
      <div class="app-sidebar__brand-text">
        <p class="app-sidebar__brand-name">{{ t('brand') }}</p>
        <p class="app-sidebar__brand-tag">{{ t('layout.appTagline') }}</p>
      </div>
    </div>

    <nav class="app-sidebar__nav" aria-label="App sections">
      <NuxtLink
        v-for="item in APP_NAV_ITEMS"
        :key="item.to"
        :to="item.to"
        class="app-sidebar__link"
        :class="{
          'app-sidebar__link--active': isNavActive(route.path, item.to),
        }"
        :aria-current="isNavActive(route.path, item.to) ? 'page' : undefined"
        @click="onNavClick"
      >
        <span
          class="material-symbols-outlined app-sidebar__link-icon"
          :class="{
            'app-sidebar__link-icon--filled': isNavActive(route.path, item.to),
          }"
          aria-hidden="true"
        >{{ item.icon }}</span>
        <span>{{ t(item.i18nKey) }}</span>
      </NuxtLink>
    </nav>

    <div class="app-sidebar__footer" aria-label="Build information">
      <p class="app-sidebar__footer-copy">© 2026 Autiqa. All rights reserved.</p>
      <p class="app-sidebar__footer-version">Alpha version</p>
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
  transition: transform 0.22s ease;
}

.app-sidebar--open {
  transform: translateX(0);
}

@media (min-width: 768px) {
  .app-sidebar {
    transform: translateX(0);
  }
}

.app-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.75rem 1.25rem 1.25rem;
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

.app-sidebar__brand-tag {
  margin: 0.125rem 0 0;
  font-family: var(--font-sans);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
}

.app-sidebar__nav {
  flex: 1;
  overflow-y: auto;
  padding: 0 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  scrollbar-width: thin;
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
