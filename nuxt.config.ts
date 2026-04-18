// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3001',
    },
  },

  modules: ['@pinia/nuxt', '@nuxtjs/i18n', '@nuxt/eslint', '@nuxt/fonts', '@nuxt/hints'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      titleTemplate: '%s · Autiqa',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },

  i18n: {
    defaultLocale: 'pl',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'pl', language: 'pl-PL', name: 'Polski', file: 'pl.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    langDir: 'locales',
    detectBrowserLanguage: false,
    vueI18n: 'app/i18n/i18n.config.ts',
  },

  fonts: {
    families: [
      { name: 'Manrope', provider: 'google', weights: [500, 600, 700, 800] },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600] },
    ],
  },
})
