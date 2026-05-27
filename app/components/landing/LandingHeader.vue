<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
</script>

<template>
  <header class="lh-nav">
    <div class="lh-nav__inner">
      <NuxtLink class="lh-logo-link" :to="localePath('/')" :aria-label="t('brand')">
        <AutiqaLogo size="md" />
      </NuxtLink>

      <nav class="lh-nav__links" :aria-label="t('landing.a11y.mainNav')">
        <a class="lh-nav__link" href="#lh-platform">{{ t('landing.nav.platform') }}</a>
        <a class="lh-nav__link" href="#lh-capabilities">{{ t('landing.nav.capabilities') }}</a>
        <a class="lh-nav__link" href="#lh-pricing">{{ t('landing.nav.pricing') }}</a>
      </nav>

      <details class="lh-mnav">
        <summary class="lh-mnav__btn" :aria-label="t('landing.a11y.menu')">
          <span class="material-symbols-outlined" aria-hidden="true">menu</span>
        </summary>
        <nav class="lh-mnav__panel" :aria-label="t('landing.a11y.menu')">
          <a class="lh-link" href="#lh-platform">{{ t('landing.nav.platform') }}</a>
          <a class="lh-link" href="#lh-capabilities">{{ t('landing.nav.capabilities') }}</a>
          <a class="lh-link" href="#lh-pricing">{{ t('landing.nav.pricing') }}</a>
          <LandingLocaleSwitcher />
          <NuxtLink class="lh-link" :to="localePath('/login')">{{ t('landing.nav.login') }}</NuxtLink>
          <NuxtLink class="lh-btn lh-btn--primary" :to="localePath('/register')">{{ t('landing.nav.cta') }}</NuxtLink>
        </nav>
      </details>

      <div class="lh-nav__cta">
        <LandingLocaleSwitcher class="lh-nav__locale" />
        <NuxtLink class="lh-ghost" :to="localePath('/login')">{{ t('landing.nav.login') }}</NuxtLink>
        <NuxtLink class="lh-btn lh-btn--primary" :to="localePath('/register')">{{ t('landing.nav.cta') }}</NuxtLink>
      </div>
    </div>
  </header>
</template>
