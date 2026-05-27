<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
</script>

<template>
  <section id="lh-capabilities" class="lh-section lh-section--spacious lh-section--bento" data-reveal aria-labelledby="lh-bento-title">
    <div class="lh-wrap">
      <p class="lh-eyebrow lh-eyebrow--bar">{{ t('landing.labels.bento') }}</p>
      <h2 id="lh-bento-title" class="lh-h2 lh-h2--bar">{{ t('landing.bento.title') }}</h2>
      <div class="lh-bento">
        <article class="lh-tile lh-tile--wide">
          <div class="lh-tile__fade" aria-hidden="true" />
          <div class="lh-tile__body">
            <span class="material-symbols-outlined lh-tile__ic lh-tile__ic--fill" aria-hidden="true">local_shipping</span>
            <h3 class="lh-tile__title">{{ t('landing.bento.fleetTitle') }}</h3>
            <p class="lh-tile__text">{{ t('landing.bento.fleetBody') }}</p>
          </div>
          <NuxtLink class="lh-tile__link" :to="localePath('/register')">
            {{ t('landing.bento.fleetLink') }}
            <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
          </NuxtLink>
        </article>
        <article class="lh-tile">
          <span class="material-symbols-outlined lh-tile__ic" aria-hidden="true">notifications_active</span>
          <h3 class="lh-tile__title lh-tile__title--sm">{{ t('landing.bento.alertsTitle') }}</h3>
          <p class="lh-tile__text">{{ t('landing.bento.alertsBody') }}</p>
        </article>
        <article class="lh-tile">
          <span class="material-symbols-outlined lh-tile__ic" aria-hidden="true">timeline</span>
          <h3 class="lh-tile__title lh-tile__title--sm">{{ t('landing.bento.timelineTitle') }}</h3>
          <p class="lh-tile__text">{{ t('landing.bento.timelineBody') }}</p>
        </article>
        <article class="lh-tile lh-tile--wide">
          <div class="lh-tile__body">
            <span class="material-symbols-outlined lh-tile__ic lh-tile__ic--fill" aria-hidden="true">payments</span>
            <h3 class="lh-tile__title">{{ t('landing.bento.financeTitle') }}</h3>
            <p class="lh-tile__text">{{ t('landing.bento.financeBody') }}</p>
          </div>
          <NuxtLink class="lh-tile__link" :to="localePath('/register')">
            {{ t('landing.bento.financeLink') }}
            <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
          </NuxtLink>
        </article>
      </div>
    </div>
  </section>
</template>
