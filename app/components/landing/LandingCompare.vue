<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <section id="lh-platform" class="lh-section lh-section--tint" data-reveal aria-labelledby="lh-compare-title">
    <div class="lh-wrap lh-section__head">
      <p class="lh-eyebrow">{{ t('landing.labels.compare') }}</p>
      <h2 id="lh-compare-title" class="lh-h2">{{ t('landing.compare.sectionTitle') }}</h2>
      <p class="lh-sub">{{ t('landing.compare.sectionLead') }}</p>
    </div>
    <div class="lh-compare">
      <div class="lh-compare__col lh-compare__col--muted">
        <div class="lh-compare__title-row">
          <span class="material-symbols-outlined lh-compare__icon" aria-hidden="true">table_chart</span>
          <h3 class="lh-h3">{{ t('landing.compare.badTitle') }}</h3>
        </div>
        <ul class="lh-list">
          <li v-for="i in 3" :key="`b-${i}`" class="lh-list__item">
            <span class="material-symbols-outlined lh-list__x" aria-hidden="true">close</span>
            <div>
              <p class="lh-list__t">{{ t(`landing.compare.bad${i}Title`) }}</p>
              <p class="lh-list__d">{{ t(`landing.compare.bad${i}Body`) }}</p>
            </div>
          </li>
        </ul>
      </div>
      <div class="lh-compare__col lh-compare__col--bright">
        <div class="lh-compare__glow" aria-hidden="true" />
        <div class="lh-compare__title-row">
          <AutiqaLogo size="sm" :show-wordmark="false" class="lh-compare__mark" />
          <h3 class="lh-h3">{{ t('landing.compare.goodTitle') }}</h3>
        </div>
        <ul class="lh-list">
          <li v-for="i in 3" :key="`g-${i}`" class="lh-list__item">
            <span class="material-symbols-outlined lh-list__ok" aria-hidden="true">check_circle</span>
            <div>
              <p class="lh-list__t">{{ t(`landing.compare.good${i}Title`) }}</p>
              <p class="lh-list__d">{{ t(`landing.compare.good${i}Body`) }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
