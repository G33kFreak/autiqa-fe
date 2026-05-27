<script setup lang="ts">
const { t } = useI18n();
const heroChartKpi = useLandingHeroKpi();
</script>

<template>
  <div class="lh-hero__visual" aria-hidden="true">
    <div class="lh-viz lh-viz--chart lh-enter lh-enter--viz1">
      <div class="lh-viz__head">
        <div>
          <p class="lh-viz__label">{{ t('landing.visual.chartLabel') }}</p>
          <p class="lh-viz__kpi">{{ heroChartKpi }}</p>
        </div>
        <div class="lh-chip">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0">trending_up</span>
          {{ t('landing.visual.chartDelta') }}
        </div>
      </div>
      <div class="lh-bars">
        <span class="lh-bar" style="--h: 32%" />
        <span class="lh-bar" style="--h: 48%" />
        <span class="lh-bar" style="--h: 62%" />
        <span class="lh-bar" style="--h: 41%" />
        <span class="lh-bar lh-bar--hot" style="--h: 88%" />
        <span class="lh-bar" style="--h: 71%" />
      </div>
    </div>

    <div class="lh-viz lh-viz--alert lh-enter lh-enter--viz2">
      <div class="lh-viz__alert-icon">
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1">warning</span>
      </div>
      <div>
        <p class="lh-viz__alert-k">{{ t('landing.visual.alertK') }}</p>
        <p class="lh-viz__alert-v">{{ t('landing.visual.alertV') }}</p>
      </div>
    </div>

    <div class="lh-viz lh-viz--card lh-enter lh-enter--viz3">
      <div class="lh-viz__card-head">
        <span class="material-symbols-outlined lh-viz__card-ic" aria-hidden="true">verified_user</span>
        <h2 class="lh-viz__card-title">{{ t('landing.visual.cardTitle') }}</h2>
      </div>
      <div class="lh-viz__row">
        <div>
          <p class="lh-viz__plate">{{ t('landing.visual.cardVehicle') }}</p>
          <p class="lh-viz__sub">{{ t('landing.visual.cardDriver') }}</p>
        </div>
        <span class="lh-viz__until">{{ t('landing.visual.cardUntil') }}</span>
      </div>
      <div class="lh-progress">
        <span class="lh-progress__fill" />
      </div>
    </div>
  </div>
</template>
