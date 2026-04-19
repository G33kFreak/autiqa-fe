<script setup lang="ts">
const { t } = useI18n();
const authStore = useAuthStore();
const { toggleSidebar } = useAppSidebar();

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
  background: color-mix(in srgb, var(--color-surface-container-lowest) 82%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 1px 0 color-mix(in srgb, var(--color-outline-variant) 12%, transparent);
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
    background 0.15s ease,
    color 0.15s ease;
}

.app-header__menu:hover {
  color: var(--color-on-surface);
  background: color-mix(in srgb, var(--color-surface-container) 50%, transparent);
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
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: var(--color-on-secondary-fixed-variant);
  background: var(--color-secondary-fixed);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-secondary-fixed) 40%, transparent);
}
</style>
