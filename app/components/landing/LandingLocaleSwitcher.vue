<script setup lang="ts">
const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const options = computed(() =>
  locales.value.map((l) => ({
    code: l.code,
    label: l.name,
    path: switchLocalePath(l.code),
  })),
);
</script>

<template>
  <div class="lh-locale" role="group" :aria-label="$t('landing.a11y.language')">
    <NuxtLink
      v-for="opt in options"
      :key="opt.code"
      class="lh-locale__btn"
      :class="{ 'lh-locale__btn--active': locale === opt.code }"
      :to="opt.path"
      :hreflang="opt.code"
      :aria-current="locale === opt.code ? 'true' : undefined"
    >
      {{ opt.code.toUpperCase() }}
    </NuxtLink>
  </div>
</template>

<style scoped>
.lh-locale {
  display: inline-flex;
  padding: 0.1875rem;
  border-radius: 999px;
  background: var(--color-surface-container);
}

.lh-locale__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.25rem;
  padding: 0.3125rem 0.5rem;
  border-radius: 999px;
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-decoration: none;
  color: var(--color-on-surface-variant);
  transition:
    color 160ms ease,
    background 160ms ease,
    transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
}

.lh-locale__btn--active {
  color: var(--color-on-secondary);
  background: linear-gradient(135deg, var(--color-secondary), var(--color-secondary-container));
}

@media (hover: hover) and (pointer: fine) {
  .lh-locale__btn:not(.lh-locale__btn--active):hover {
    color: var(--color-on-surface);
    background: var(--color-surface-container-high);
  }
}

.lh-locale__btn:active {
  transform: scale(0.97);
}
</style>
