<script setup lang="ts">
const localePath = useLocalePath();

const props = withDefaults(
  defineProps<{
    brandHref?: string;
    maxWidth?: string;
  }>(),
  {
    brandHref: undefined,
    maxWidth: '28rem',
  },
);

const brandTo = computed(() => props.brandHref ?? localePath('/'));
</script>

<template>
  <div class="auth-flow">
    <div class="auth-flow__atmosphere" aria-hidden="true">
      <div class="auth-flow__glow auth-flow__glow--tr" />
      <div class="auth-flow__glow auth-flow__glow--bl" />
      <div class="auth-flow__grain" />
    </div>

    <header class="auth-flow__top">
      <NuxtLink
        class="auth-flow__brand"
        :to="brandTo"
        :aria-label="$t('brand')"
      >
        <AutiqaLogo size="md" />
      </NuxtLink>
      <slot name="top-end" />
    </header>

    <main class="auth-flow__main">
      <div class="auth-flow__card" :style="{ maxWidth }">
        <slot />
      </div>
      <div v-if="$slots.below" class="auth-flow__below">
        <slot name="below" />
      </div>
    </main>
  </div>
</template>
