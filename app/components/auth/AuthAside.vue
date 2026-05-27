<script setup lang="ts">
const localePath = useLocalePath();

const props = defineProps<{
  headlineId: string;
  kicker?: string;
  headline: string;
  lede: string;
  pluses: string[];
  brandHref?: string;
}>();
</script>

<template>
  <section class="auth__aside" :aria-labelledby="props.headlineId">
    <div class="auth__aside-inner">
      <header class="auth__brand">
        <NuxtLink
          class="auth__brand-link"
          :to="brandHref ?? localePath('/')"
          :aria-label="$t('brand')"
        >
          <AutiqaLogo size="lg" />
        </NuxtLink>
      </header>

      <p v-if="kicker" class="auth__kicker">{{ kicker }}</p>

      <h1 :id="props.headlineId" class="auth__headline">
        {{ headline }}
      </h1>
      <p class="auth__lede">{{ lede }}</p>

      <ul class="auth__pluses">
        <li v-for="(item, i) in pluses" :key="i" class="auth__plus">
          <span class="auth__plus-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="auth__plus-text">{{ item }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
