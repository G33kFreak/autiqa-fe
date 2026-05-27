<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <section class="lh-section" data-reveal aria-labelledby="lh-deep-title">
    <div class="lh-wrap">
      <p class="lh-eyebrow lh-eyebrow--bar">{{ t('landing.labels.deep') }}</p>
      <h2 id="lh-deep-title" class="lh-h2 lh-h2--bar">{{ t('landing.deep.title') }}</h2>
      <p class="lh-sub lh-sub--center">{{ t('landing.deep.lead') }}</p>
      <div class="lh-cards2">
        <article class="lh-card2 lh-card2--finance">
          <div class="lh-card2__icon lh-card2__icon--finance-brand">
            <span class="material-symbols-outlined" aria-hidden="true">account_balance</span>
          </div>
          <h3 class="lh-h3">{{ t('landing.deep.finTitle') }}</h3>
          <p class="lh-card2__body">{{ t('landing.deep.finBody') }}</p>
          <div class="lh-card2__strip lh-card2__strip--finance">
            <div>
              <p class="lh-strip-label">{{ t('landing.deep.finStripLabel') }}</p>
              <p class="lh-strip-value lh-strip-value--blue">{{ t('landing.deep.finStripValue') }}</p>
            </div>
            <span class="material-symbols-outlined lh-strip-ic lh-strip-ic--finance" aria-hidden="true">analytics</span>
          </div>
        </article>
        <article class="lh-card2 lh-card2--compliance">
          <div class="lh-card2__icon lh-card2__icon--success">
            <span class="material-symbols-outlined" aria-hidden="true">health_and_safety</span>
          </div>
          <h3 class="lh-h3">{{ t('landing.deep.compTitle') }}</h3>
          <p class="lh-card2__body">{{ t('landing.deep.compBody') }}</p>
          <div class="lh-card2__strip lh-card2__strip--compliance">
            <div>
              <p class="lh-strip-label">{{ t('landing.deep.compStripLabel') }}</p>
              <p class="lh-strip-value lh-strip-value--success">{{ t('landing.deep.compStripValue') }}</p>
            </div>
            <span class="material-symbols-outlined lh-strip-ic lh-strip-ic--compliance" aria-hidden="true">event_note</span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
