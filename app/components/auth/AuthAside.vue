<script setup lang="ts">
const localePath = useLocalePath();

const props = withDefaults(
  defineProps<{
    headlineId: string;
    kicker?: string;
    headline: string;
    lede: string;
    pluses: string[];
    /** Material symbol per plus line (defaults to check_circle). */
    plusIcons?: string[];
    brandHref?: string;
  }>(),
  {
    plusIcons: () => [],
  },
);

const icons = computed(() => {
  const defaults = ['route', 'insights', 'verified_user'];
  return props.pluses.map((_, i) => props.plusIcons[i] ?? defaults[i % defaults.length]);
});
</script>

<template>
  <aside class="auth-split__aside" :aria-labelledby="props.headlineId">
    <div class="auth-split__aside-texture" aria-hidden="true" />
    <div class="auth-split__aside-inner">
      <header class="auth-split__brand">
        <NuxtLink
          class="auth-split__brand-link"
          :to="brandHref ?? localePath('/')"
          :aria-label="$t('brand')"
        >
          <AutiqaLogo size="lg" />
        </NuxtLink>
      </header>

      <p v-if="kicker" class="auth-split__kicker">{{ kicker }}</p>

      <h1 :id="props.headlineId" class="auth-split__headline">
        {{ headline }}
      </h1>
      <p class="auth-split__lede">{{ lede }}</p>

      <ul class="auth-split__features">
        <li
          v-for="(item, i) in pluses"
          :key="i"
          class="auth-split__feature"
        >
          <span class="auth-split__feature-icon" aria-hidden="true">
            <span class="material-symbols-outlined">{{ icons[i] }}</span>
          </span>
          <span class="auth-split__feature-text">{{ item }}</span>
        </li>
      </ul>
    </div>
  </aside>
</template>
