<script setup lang="ts">
const authStore = useAuthStore();
const localePath = useLocalePath();

const loggingOut = ref(false);

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
  <div class="app-shell">
    <header class="app-bar">
      <NuxtLink :to="localePath('/app')" class="app-bar__logo">
        <AutiqaLogo :size="24" />
      </NuxtLink>

      <div class="app-bar__right">
        <span v-if="authStore.user" class="app-bar__user">
          {{ authStore.user.name }}
        </span>
        <button
          type="button"
          class="app-bar__logout"
          :disabled="loggingOut"
          @click="onLogout"
        >
          {{ $t('app.logout') }}
        </button>
      </div>
    </header>

    <main class="app-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.app-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-outline);
  background: var(--color-surface);
}

.app-bar__logo {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.app-bar__right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.app-bar__user {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-ink);
}

.app-bar__logout {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1.5px solid var(--color-outline);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-ink);
  cursor: pointer;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.app-bar__logout:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.app-bar__logout:disabled {
  opacity: 0.6;
  cursor: progress;
}

.app-main {
  flex: 1;
  padding: var(--space-8) var(--space-6);
}
</style>
