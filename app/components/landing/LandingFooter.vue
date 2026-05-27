<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
</script>

<template>
  <footer class="lh-footer">
    <div class="lh-footer__inner">
      <div class="lh-footer__brand">
        <NuxtLink class="lh-footer__logo" :to="localePath('/')" :aria-label="t('brand')">
          <AutiqaLogo size="lg" mono />
        </NuxtLink>
        <p class="lh-footer__tag">{{ t('landing.footer.tagline') }}</p>
      </div>

      <nav class="lh-footer__col" :aria-label="t('landing.footer.product')">
        <p class="lh-footer__col-k">{{ t('landing.footer.product') }}</p>
        <a class="lh-footer__link" href="#lh-platform">{{ t('landing.nav.platform') }}</a>
        <a class="lh-footer__link" href="#lh-capabilities">{{ t('landing.nav.capabilities') }}</a>
        <a class="lh-footer__link" href="#lh-pricing">{{ t('landing.nav.pricing') }}</a>
      </nav>

      <nav class="lh-footer__col" :aria-label="t('landing.footer.account')">
        <p class="lh-footer__col-k">{{ t('landing.footer.account') }}</p>
        <NuxtLink class="lh-footer__link" :to="localePath('/login')">{{ t('landing.nav.login') }}</NuxtLink>
        <NuxtLink class="lh-footer__link" :to="localePath('/register')">{{ t('landing.footer.register') }}</NuxtLink>
      </nav>

      <div class="lh-footer__end">
        <LandingLocaleSwitcher />
        <p class="lh-footer__copy">{{ t('landing.footer.copy') }}</p>
      </div>
    </div>
  </footer>
</template>
