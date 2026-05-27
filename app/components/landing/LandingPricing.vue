<script setup lang="ts">
const props = defineProps<{
  reduceMotion: boolean;
}>();

const { t } = useI18n();
const localePath = useLocalePath();

const {
  FLEET_MIN,
  FLEET_MAX,
  PRICE_PER_VEHICLE_PLN,
  fleetCount,
  calcTransitioning,
  isEnterprise,
  isFreeTier,
  billableVehicles,
  monthlyFormatted,
  sliderFillPct,
  salesMailto,
} = useFleetPricing(toRef(props, 'reduceMotion'));
</script>

<template>
  <section id="lh-pricing" class="lh-section lh-section--pricing" data-reveal aria-labelledby="lh-pricing-title">
    <div class="lh-wrap lh-calc">
      <div class="lh-calc__intro">
        <p class="lh-eyebrow lh-eyebrow--bar">{{ t('landing.labels.pricing') }}</p>
        <h2 id="lh-pricing-title" class="lh-h2 lh-h2--bar">{{ t('landing.calculator.title') }}</h2>
        <p class="lh-sub">{{ t('landing.calculator.lead') }}</p>
        <ul class="lh-calc__perks" :aria-label="t('landing.calculator.perksAria')">
          <li class="lh-calc__perk">
            <span class="material-symbols-outlined" aria-hidden="true">verified</span>
            {{ t('landing.calculator.perk1') }}
          </li>
          <li class="lh-calc__perk">
            <span class="material-symbols-outlined" aria-hidden="true">trending_flat</span>
            {{ t('landing.calculator.perk2') }}
          </li>
          <li class="lh-calc__perk">
            <span class="material-symbols-outlined" aria-hidden="true">support_agent</span>
            {{ t('landing.calculator.perk3') }}
          </li>
        </ul>
      </div>

      <div class="lh-calc__panel">
        <div class="lh-calc__slider-head">
          <label class="lh-calc__slider-label" for="lh-fleet-slider">
            <span class="lh-calc__slider-label-text">{{ t('landing.calculator.sliderLabel') }}</span>
          </label>
          <p class="lh-calc__count" aria-live="polite">
            <span class="lh-calc__count-n">{{ fleetCount }}</span>
          </p>
        </div>

        <div class="lh-calc__range-wrap">
          <div class="lh-calc__range-track" aria-hidden="true">
            <span class="lh-calc__range-fill" :style="{ width: `${sliderFillPct}%` }" />
          </div>
          <input
            id="lh-fleet-slider"
            v-model.number="fleetCount"
            class="lh-calc__range"
            type="range"
            :min="FLEET_MIN"
            :max="FLEET_MAX"
            step="1"
            :aria-valuetext="t('landing.calculator.sliderAria', { count: fleetCount })"
          >
        </div>

        <div class="lh-calc__scale" aria-hidden="true">
          <span>{{ FLEET_MIN }}</span>
          <span>{{ FLEET_MAX }}+</span>
        </div>

        <div class="lh-calc__result" :class="{ 'lh-calc__result--blur': calcTransitioning }">
          <template v-if="isEnterprise">
            <p class="lh-calc__result-k">{{ t('landing.calculator.enterpriseKicker') }}</p>
            <p class="lh-calc__result-title">
              {{ t('landing.calculator.enterpriseTitleBefore') }}
              <span class="lh-calc__result-accent">{{ t('landing.calculator.enterpriseTitleAccent') }}</span>{{ t('landing.calculator.enterpriseTitleAfter') }}
            </p>
            <p class="lh-calc__result-note">{{ t('landing.calculator.enterpriseBody') }}</p>
          </template>
          <template v-else-if="isFreeTier">
            <p class="lh-calc__result-k">{{ t('landing.calculator.estimateLabel') }}</p>
            <p class="lh-calc__result-price">
              <span class="lh-calc__result-amount">{{ t('landing.calculator.freePrice') }}</span>
              <span class="lh-calc__result-netto">{{ t('landing.calculator.netto') }}</span>
            </p>
            <p class="lh-calc__result-note">{{ t('landing.calculator.freeNote') }}</p>
          </template>
          <template v-else>
            <p class="lh-calc__result-k">{{ t('landing.calculator.estimateLabel') }}</p>
            <p class="lh-calc__result-price">
              <span class="lh-calc__result-amount">{{ monthlyFormatted }}</span>
              <span class="lh-calc__result-netto">{{ t('landing.calculator.netto') }}</span>
            </p>
            <p class="lh-calc__result-note">
              {{
                t('landing.calculator.paidNote', {
                  billable: billableVehicles,
                  rate: PRICE_PER_VEHICLE_PLN,
                  netto: t('landing.calculator.netto'),
                })
              }}
            </p>
          </template>
        </div>

        <div class="lh-calc__actions">
          <NuxtLink
            v-if="!isEnterprise"
            class="lh-btn lh-btn--primary lh-btn--lg lh-calc__cta"
            :to="localePath('/register')"
          >
            {{ t('landing.calculator.ctaStart') }}
            <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
          </NuxtLink>
          <a
            v-else
            class="lh-btn lh-btn--primary lh-btn--lg lh-calc__cta"
            :href="salesMailto"
          >
            {{ t('landing.calculator.ctaContact') }}
            <span class="material-symbols-outlined" aria-hidden="true">mail</span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
