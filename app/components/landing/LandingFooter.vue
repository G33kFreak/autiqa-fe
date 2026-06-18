<script setup lang="ts">
const localePath = useLocalePath()
</script>

<template>
  <footer class="site-footer">
    <div class="landing-container">
      <div v-reveal="{ y: 16 }" class="site-footer__body">
        <div class="site-footer__brand">
          <NuxtLink :to="localePath('/')">
            <AutiqaLogo :light="true" />
          </NuxtLink>
          <p class="site-footer__tagline">{{ $t('footer.tagline') }}</p>
        </div>

        <nav class="site-footer__col" aria-label="Product links">
          <span class="site-footer__col-head">{{ $t('footer.product') }}</span>
          <ul>
            <li><a href="#features">{{ $t('footer.links.features') }}</a></li>
            <li><a href="#pricing">{{ $t('footer.links.pricing') }}</a></li>
            <li><NuxtLink :to="localePath('/login')">{{ $t('footer.links.login') }}</NuxtLink></li>
          </ul>
        </nav>

        <nav class="site-footer__col" aria-label="Company links">
          <span class="site-footer__col-head">{{ $t('footer.company') }}</span>
          <ul>
            <li><NuxtLink :to="localePath('/about')">{{ $t('footer.links.about') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/privacy')">{{ $t('footer.links.privacy') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/terms')">{{ $t('footer.links.terms') }}</NuxtLink></li>
          </ul>
        </nav>
      </div>

      <div class="site-footer__bottom">
        <span class="site-footer__copyright">{{ $t('footer.copyright') }}</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--color-dark-bg);
  border-top: 1px solid var(--color-dark-outline);
  padding: var(--space-16) 0 var(--space-8);
}

.site-footer__body {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--space-12);
  padding-bottom: var(--space-12);
  border-bottom: 1px solid var(--color-dark-outline);
}

.site-footer__brand {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.site-footer__tagline {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 300;
  color: var(--color-dark-muted);
  max-width: 30ch;
  line-height: 1.5;
}

.site-footer__col {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.site-footer__col-head {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: oklch(0.420 0.020 270);
}

.site-footer__col ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.site-footer__col ul a {
  font-size: 0.9375rem;
  color: var(--color-dark-muted);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out);
}

.site-footer__col ul a:hover {
  color: var(--color-dark-ink);
}

.site-footer__bottom {
  display: flex;
  align-items: center;
  padding-top: var(--space-8);
}

.site-footer__copyright {
  font-size: 0.875rem;
  color: oklch(0.380 0.018 270);
}

@media (max-width: 767px) {
  .site-footer__body {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-8);
  }

  .site-footer__brand {
    grid-column: 1 / -1;
  }
}
</style>
