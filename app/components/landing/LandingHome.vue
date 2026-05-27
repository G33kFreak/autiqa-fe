<script setup lang="ts">
const { t } = useI18n();

const rootRef = ref<HTMLElement | null>(null);
const { reduceMotion } = useLandingMotion(rootRef);
</script>

<template>
  <div ref="rootRef" class="lh">
    <a class="lh-skip" href="#lh-main">{{ t('landing.a11y.skip') }}</a>

    <LandingHeader />

    <main id="lh-main">
      <LandingHero />
      <LandingCompare />
      <LandingDeepDive />
      <LandingBento />
      <LandingPricing :reduce-motion="reduceMotion" />
    </main>

    <LandingFooter />
  </div>
</template>

<style>
@import '~/assets/css/landing.css';
</style>
