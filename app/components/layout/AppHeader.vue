<script setup lang="ts">
const { t } = useI18n();
const authStore = useAuthStore();
const { toggleSidebar } = useAppSidebar();
const { title: routeTitle } = useAppRouteTitle();

const displayName = computed(() => authStore.user?.name?.trim() || t('layout.userFallback'));
const displayEmail = computed(() => authStore.user?.email?.trim() || '');

const initials = computed(() => {
  const name = authStore.user?.name?.trim();
  if (!name) return '?';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});
</script>

<template>
  <header class="app-header">
    <div class="app-header__left">
      <button
        type="button"
        class="app-header__menu"
        :aria-label="t('layout.openMenu')"
        @click="toggleSidebar"
      >
        <span class="material-symbols-outlined" aria-hidden="true">menu</span>
      </button>
      <p class="app-header__context">
        <span class="app-header__context-label">{{ t('layout.appTagline') }}</span>
        <span class="app-header__context-title">{{ routeTitle }}</span>
      </p>
    </div>

    <div class="app-header__right">
      <div class="app-header__user-text">
        <p class="app-header__user-name">{{ displayName }}</p>
        <p v-if="displayEmail" class="app-header__user-email">{{ displayEmail }}</p>
      </div>
      <div class="app-header__avatar" :title="displayName" aria-hidden="true">
        {{ initials }}
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 4rem;
  padding: 0 1rem 0 1rem;
  background: color-mix(in srgb, var(--color-surface-container-lowest) 88%, var(--color-surface) 12%);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

@media (min-width: 768px) {
  .app-header {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

.app-header__left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.app-header__context {
  display: none;
  flex-direction: column;
  gap: 0.1rem;
  margin: 0;
  min-width: 0;
}

@media (min-width: 768px) {
  .app-header__context {
    display: flex;
  }
}

.app-header__context-label {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-on-surface-variant) 75%, transparent);
}

.app-header__context-title {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-on-surface);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-header__menu {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: none;
  border-radius: 0.75rem;
  background: transparent;
  color: var(--color-on-surface-variant);
  cursor: pointer;
  transition:
    background var(--app-duration-fast, 160ms) var(--app-ease-out, ease),
    color var(--app-duration-fast, 160ms) var(--app-ease-out, ease),
    transform var(--app-duration-fast, 160ms) var(--app-ease-out, ease);
}

.app-header__menu:active {
  transform: scale(0.94);
}

@media (hover: hover) and (pointer: fine) {
  .app-header__menu:hover {
    color: var(--color-on-surface);
    background: color-mix(in srgb, var(--color-surface-container) 55%, transparent);
  }
}

.app-header__menu:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 30%, transparent);
  outline-offset: 2px;
}

@media (min-width: 768px) {
  .app-header__menu {
    display: none;
  }
}

.app-header__menu .material-symbols-outlined {
  font-size: 1.5rem;
}

.app-header__right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}

.app-header__user-text {
  text-align: right;
  min-width: 0;
}

.app-header__user-name {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-on-surface);
  line-height: 1.25;
  max-width: 12rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-header__user-email {
  margin: 0.125rem 0 0;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--color-outline);
  max-width: 12rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-header__avatar {
  flex-shrink: 0;
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: var(--color-on-secondary-fixed-variant);
  background: linear-gradient(
    145deg,
    var(--color-secondary-fixed) 0%,
    color-mix(in srgb, var(--color-secondary-fixed) 70%, var(--color-surface-container-lowest)) 100%
  );
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--color-secondary) 14%, transparent),
    var(--shadow-ambient);
}
</style>
