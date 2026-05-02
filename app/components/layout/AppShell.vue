<script setup lang="ts">
const { open, closeSidebar, collapsed } = useAppSidebar();

if (import.meta.client) {
  function syncBodyScroll() {
    const desktop = window.matchMedia('(min-width: 768px)').matches;
    document.body.style.overflow = desktop || !open.value ? '' : 'hidden';
  }

  watch(open, syncBodyScroll);

  onUnmounted(() => {
    document.body.style.overflow = '';
  });

  onMounted(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open.value) {
        e.preventDefault();
        closeSidebar();
      }
    };
    window.addEventListener('keydown', onKey);
    onUnmounted(() => window.removeEventListener('keydown', onKey));

    const mq = window.matchMedia('(min-width: 768px)');
    const onMq = () => {
      if (mq.matches) {
        closeSidebar();
      }
      syncBodyScroll();
    };
    mq.addEventListener('change', onMq);
    onUnmounted(() => mq.removeEventListener('change', onMq));
  });
}

function onBackdropClick() {
  closeSidebar();
}
</script>

<template>
  <div class="app-shell" :class="{ 'app-shell--sidebar-collapsed': collapsed }">
    <div
      class="app-shell__backdrop"
      :class="{ 'app-shell__backdrop--visible': open }"
      aria-hidden="true"
      @click="onBackdropClick"
    />

    <LayoutAppSidebar />

    <div class="app-shell__main-wrap">
      <LayoutAppHeader />
      <main class="app-shell__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100dvh;
  background: var(--color-surface);
  color: var(--color-on-surface);
}

.app-shell__backdrop {
  position: fixed;
  inset: 0;
  z-index: 45;
  background: color-mix(in srgb, var(--color-inverse-surface) 35%, transparent);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.app-shell__backdrop--visible {
  opacity: 1;
  pointer-events: auto;
}

@media (min-width: 768px) {
  .app-shell__backdrop {
    display: none;
  }
}

.app-shell__main-wrap {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

@media (min-width: 768px) {
  .app-shell__main-wrap {
    margin-left: 16rem;
    transition: margin-left 0.22s ease;
  }

  .app-shell--sidebar-collapsed .app-shell__main-wrap {
    margin-left: 4.5rem;
  }
}

.app-shell__content {
  flex: 1;
  padding: 1.5rem 1rem 2rem;
}

@media (min-width: 768px) {
  .app-shell__content {
    padding: 2rem 2rem 2.5rem;
  }
}
</style>
