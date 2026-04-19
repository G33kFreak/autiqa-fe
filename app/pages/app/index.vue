<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
const authStore = useAuthStore();

useSeoMeta({
  title: computed(() => t('meta.app.title')),
  description: computed(() => t('meta.app.description')),
});

async function onLogout() {
  await authStore.logout();
}
</script>

<template>
  <div class="dash">
    <h1 class="app-page__title">{{ t('appSections.dashboard.title') }}</h1>
    <p class="app-page__lead">{{ t('appSections.dashboard.lead') }}</p>

    <div class="dash__grid">
      <div class="dash__card dash__card--accent">
        <p class="dash__eyebrow">{{ t('brand') }}</p>
        <p class="dash__card-title">{{ t('layout.appTagline') }}</p>
        <p class="dash__card-hint">{{ t('appSections.dashboard.lead') }}</p>
      </div>
      <NuxtLink to="/app/fleet" class="dash__card dash__card--link">
        <p class="dash__eyebrow">{{ t('nav.fleet') }}</p>
        <p class="dash__card-title">{{ t('appSections.fleet.title') }}</p>
        <p class="dash__card-hint">{{ t('appSections.fleet.lead') }}</p>
        <span class="dash__chevron material-symbols-outlined" aria-hidden="true">arrow_forward</span>
      </NuxtLink>
      <NuxtLink to="/app/finance" class="dash__card dash__card--link">
        <p class="dash__eyebrow">{{ t('nav.finance') }}</p>
        <p class="dash__card-title">{{ t('appSections.finance.title') }}</p>
        <p class="dash__card-hint">{{ t('appSections.finance.lead') }}</p>
        <span class="dash__chevron material-symbols-outlined" aria-hidden="true">arrow_forward</span>
      </NuxtLink>
    </div>

    <div class="dash__actions">
      <NuxtLink :to="localePath('/')" class="dash__ghost">
        {{ t('appShell.backHome') }}
      </NuxtLink>
      <button type="button" class="dash__secondary" @click="onLogout">
        {{ t('appShell.logoutDebug') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.dash__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .dash__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }
}

.dash__card {
  position: relative;
  padding: 1.25rem 1.25rem 1.35rem;
  border-radius: 0.75rem;
  background: var(--color-surface-container-lowest);
  transition:
    background 0.18s ease,
    transform 0.18s ease;
}

.dash__card--accent {
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-secondary-container) 92%, var(--color-secondary)) 0%,
    var(--color-secondary-container) 100%
  );
  color: var(--color-on-secondary);
  box-shadow: 0 12px 32px color-mix(in srgb, var(--color-secondary) 18%, transparent);
}

.dash__card--accent .dash__eyebrow {
  color: color-mix(in srgb, var(--color-on-secondary) 75%, transparent);
}

.dash__card--accent .dash__card-hint {
  color: color-mix(in srgb, var(--color-on-secondary) 82%, transparent);
}

.dash__card--link {
  text-decoration: none;
  color: inherit;
  display: block;
  overflow: hidden;
}

.dash__card--link:hover {
  background: var(--color-surface-container-low);
  transform: translateY(-1px);
}

.dash__card--link:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  outline-offset: 2px;
}

.dash__eyebrow {
  margin: 0 0 0.35rem;
  font-family: var(--font-sans);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-outline);
}

.dash__card-title {
  margin: 0 0 0.5rem;
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.dash__card--accent .dash__card-title {
  font-size: 1.25rem;
  font-weight: 800;
}

.dash__card-hint {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.45;
  color: var(--color-on-surface-variant);
}

.dash__chevron {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  font-size: 1.25rem;
  color: var(--color-secondary-container);
  opacity: 0.85;
}

.dash__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
}

.dash__ghost {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-secondary);
  text-decoration: none;
}

.dash__ghost:hover {
  color: var(--color-secondary-container);
}

.dash__ghost:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 30%, transparent);
  outline-offset: 2px;
  border-radius: 0.25rem;
}

.dash__secondary {
  padding: 0.5rem 0.875rem;
  border: none;
  border-radius: 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-on-surface);
  background: var(--color-surface-container-high);
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.dash__secondary:hover {
  opacity: 0.92;
}

.dash__secondary:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-secondary) 30%, transparent);
  outline-offset: 2px;
}
</style>
