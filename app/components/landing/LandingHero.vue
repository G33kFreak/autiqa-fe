<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
</script>

<template>
  <section class="lh-hero" aria-labelledby="lh-hero-title">
    <div class="lh-hero__mesh" aria-hidden="true" />
    <div class="lh-hero__glow" aria-hidden="true" />
    <div class="lh-hero__grid">
      <div class="lh-hero__copy">
        <p class="lh-kicker lh-enter lh-enter--0">
          <span class="lh-kicker__dot" aria-hidden="true" />
          {{ t('landing.hero.kicker') }}
        </p>
        <h1 id="lh-hero-title" class="lh-hero__title lh-enter lh-enter--1">
          {{ t('landing.hero.title1') }}<br >
          <span class="lh-hero__accent">{{ t('landing.hero.title2') }}</span>
        </h1>
        <p class="lh-hero__lead lh-enter lh-enter--2">{{ t('landing.hero.lead') }}</p>
        <div class="lh-hero__actions">
          <NuxtLink class="lh-btn lh-btn--primary lh-btn--lg lh-enter lh-enter--3" :to="localePath('/register')">
            {{ t('landing.hero.ctaPrimary') }}
            <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
          </NuxtLink>
          <a class="lh-btn lh-btn--secondary lh-btn--lg lh-enter lh-enter--4" href="#lh-platform">{{ t('landing.hero.ctaSecondary') }}</a>
        </div>
        <ul class="lh-hero__proof lh-enter lh-enter--5" :aria-label="t('landing.hero.proofAria')">
          <li class="lh-hero__proof-item">
            <span class="material-symbols-outlined lh-hero__proof-ic" aria-hidden="true">verified</span>
            {{ t('landing.hero.proof1') }}
          </li>
          <li class="lh-hero__proof-item">
            <span class="material-symbols-outlined lh-hero__proof-ic" aria-hidden="true">notifications_active</span>
            {{ t('landing.hero.proof2') }}
          </li>
          <li class="lh-hero__proof-item">
            <span class="material-symbols-outlined lh-hero__proof-ic" aria-hidden="true">payments</span>
            {{ t('landing.hero.proof3') }}
          </li>
        </ul>
      </div>

      <LandingHeroVisual />
    </div>
  </section>
</template>
