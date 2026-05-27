<script setup lang="ts">
const localePath = useLocalePath();

const props = withDefaults(
  defineProps<{
    titleId: string;
    title: string;
    subtitle: string;
    showMobileBrand?: boolean;
    brandHref?: string;
  }>(),
  {
    showMobileBrand: false,
  },
);

const brandTo = computed(() => props.brandHref ?? localePath('/'));
</script>

<template>
  <header class="auth-head">
    <div v-if="showMobileBrand" class="auth-head__brand">
      <NuxtLink
        class="auth-split__brand-link"
        :to="brandTo"
        :aria-label="$t('brand')"
      >
        <AutiqaLogo size="md" />
      </NuxtLink>
    </div>
    <h2 :id="titleId" class="auth-head__title">{{ title }}</h2>
    <p class="auth-head__subtitle">{{ subtitle }}</p>
  </header>
</template>
