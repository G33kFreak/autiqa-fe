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
  <header class="auth__panel-head">
    <div v-if="showMobileBrand" class="auth__brand auth__brand--mobile">
      <NuxtLink
        class="auth__brand-link"
        :to="brandTo"
        :aria-label="$t('brand')"
      >
        <AutiqaLogo size="md" />
      </NuxtLink>
    </div>
    <h2 :id="titleId" class="auth__title">{{ title }}</h2>
    <p class="auth__subtitle">{{ subtitle }}</p>
  </header>
</template>
