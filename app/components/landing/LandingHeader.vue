<script setup lang="ts">
const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()

const scrolled = ref(false)
const menuOpen = ref(false)

let _scrollHandler: (() => void) | undefined

onMounted(() => {
  _scrollHandler = () => { scrolled.value = window.scrollY > 48 }
  window.addEventListener('scroll', _scrollHandler, { passive: true })
})

onUnmounted(() => {
  if (_scrollHandler) window.removeEventListener('scroll', _scrollHandler)
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <header class="site-header" :class="{ 'site-header--scrolled': scrolled }">
    <div class="site-header__inner landing-container">
      <NuxtLink :to="localePath('/')" class="site-header__logo" @click="closeMenu">
        <AutiqaLogo :light="!scrolled" />
      </NuxtLink>

      <nav class="site-header__nav" aria-label="Main">
        <a href="#features" class="nav-link" @click="closeMenu">{{ $t('nav.features') }}</a>
        <a href="#pricing" class="nav-link" @click="closeMenu">{{ $t('nav.pricing') }}</a>
        <a href="#faq" class="nav-link" @click="closeMenu">{{ $t('nav.faq') }}</a>
      </nav>

      <div class="site-header__actions">
        <a
          :href="switchLocalePath(locale === 'pl' ? 'en' : 'pl')"
          class="locale-toggle"
        >{{ locale === 'pl' ? 'EN' : 'PL' }}</a>
        <NuxtLink :to="localePath('/login')" class="nav-link">{{ $t('nav.login') }}</NuxtLink>
        <NuxtLink :to="localePath('/register')" class="btn" :class="scrolled ? 'btn--primary' : 'btn--ghost-light'">
          {{ $t('nav.signUp') }}
        </NuxtLink>
      </div>

      <button
        class="menu-btn"
        :class="{ 'menu-btn--open': menuOpen }"
        :aria-expanded="menuOpen"
        aria-controls="mobile-menu"
        aria-label="Toggle menu"
        @click="toggleMenu"
      >
        <span class="menu-btn__bar" />
        <span class="menu-btn__bar" />
        <span class="menu-btn__bar" />
      </button>
    </div>

    <div
      id="mobile-menu"
      class="mobile-menu"
      :class="{ 'mobile-menu--open': menuOpen }"
    >
      <nav class="mobile-menu__nav">
        <a href="#features" class="mobile-nav-link" @click="closeMenu">{{ $t('nav.features') }}</a>
        <a href="#pricing" class="mobile-nav-link" @click="closeMenu">{{ $t('nav.pricing') }}</a>
        <a href="#faq" class="mobile-nav-link" @click="closeMenu">{{ $t('nav.faq') }}</a>
        <NuxtLink :to="localePath('/login')" class="mobile-nav-link" @click="closeMenu">{{ $t('nav.login') }}</NuxtLink>
      </nav>
      <div class="mobile-menu__footer">
        <NuxtLink :to="localePath('/register')" class="btn btn--primary" style="width: 100%; justify-content: center" @click="closeMenu">
          {{ $t('nav.signUp') }}
        </NuxtLink>
        <a :href="switchLocalePath(locale === 'pl' ? 'en' : 'pl')" class="locale-toggle">
          {{ locale === 'pl' ? 'English' : 'Polski' }}
        </a>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* ── Shell ────────────────────────────────────────────────── */

.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  transition:
    background-color var(--duration-ui) var(--ease-out),
    box-shadow var(--duration-ui) var(--ease-out);
}

.site-header--scrolled {
  background: var(--color-bg);
  box-shadow: 0 1px 0 var(--color-outline), var(--shadow-ambient);
}

.site-header__inner {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  height: 4.5rem;
}

/* ── Logo ─────────────────────────────────────────────────── */

.site-header__logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  text-decoration: none;
}

/* ── Desktop nav ──────────────────────────────────────────── */

.site-header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1;
  color: oklch(1.000 0.000 0 / 0.82);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out);
  white-space: nowrap;
}

.nav-link:hover {
  color: oklch(1.000 0.000 0);
}

.site-header--scrolled .nav-link {
  color: var(--color-muted);
}

.site-header--scrolled .nav-link:hover {
  color: var(--color-ink);
}

.site-header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-left: auto;
}

.locale-toggle {
  font-size: 0.875rem;
  font-weight: 500;
  color: oklch(1.000 0.000 0 / 0.60);
  text-decoration: none;
  letter-spacing: 0.04em;
  transition: color var(--duration-fast) var(--ease-out);
  cursor: pointer;
}

.locale-toggle:hover {
  color: oklch(1.000 0.000 0 / 0.90);
}

.site-header--scrolled .locale-toggle {
  color: var(--color-muted);
}

.site-header--scrolled .locale-toggle:hover {
  color: var(--color-ink);
}

/* ── Hamburger ────────────────────────────────────────────── */

.menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: auto;
  flex-shrink: 0;
}

.menu-btn__bar {
  display: block;
  width: 100%;
  height: 1.5px;
  background: oklch(1.000 0.000 0 / 0.85);
  border-radius: 1px;
  transition:
    transform var(--duration-ui) var(--ease-out),
    opacity var(--duration-ui) var(--ease-out);
  transform-origin: center;
}

.site-header--scrolled .menu-btn__bar {
  background: var(--color-ink);
}

.menu-btn--open .menu-btn__bar:nth-child(1) {
  transform: translateY(6.5px) rotate(45deg);
}

.menu-btn--open .menu-btn__bar:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.menu-btn--open .menu-btn__bar:nth-child(3) {
  transform: translateY(-6.5px) rotate(-45deg);
}

/* ── Mobile menu ──────────────────────────────────────────── */

.mobile-menu {
  display: none;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6);
  background: var(--color-bg);
  border-top: 1px solid var(--color-outline);
}

.mobile-nav-link {
  display: block;
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--color-ink);
  text-decoration: none;
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-outline);
  transition: color var(--duration-fast) var(--ease-out);
}

.mobile-nav-link:hover {
  color: var(--color-primary);
}

.mobile-menu__footer {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  align-items: center;
  padding-top: var(--space-2);
}

/* ── Responsive ───────────────────────────────────────────── */

@media (max-width: 767px) {
  .site-header__nav,
  .site-header__actions {
    display: none;
  }

  .menu-btn {
    display: flex;
  }

  .mobile-menu--open {
    display: flex;
  }
}
</style>
