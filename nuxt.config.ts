export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/fonts", "@nuxt/eslint", "@nuxtjs/i18n", "@pinia/nuxt"],

  css: ["~/assets/css/main.css"],

  fonts: {
    families: [
      { name: "Syne", provider: "google", weights: [400, 600, 700, 800] },
      { name: "Onest", provider: "google", weights: [300, 400, 500, 600] },
    ],
    defaults: {
      preload: true,
    },
  },

  app: {
    head: {
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;600&family=Syne:wght@400;600;700;800&display=swap",
        },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.ico" },
      ],
    },
  },

  i18n: {
    defaultLocale: "pl",
    strategy: "prefix_except_default",
    locales: [
      { code: "pl", language: "pl-PL", name: "Polski", file: "pl.json" },
      { code: "en", language: "en-US", name: "English", file: "en.json" },
    ],
    langDir: "locales",
    detectBrowserLanguage: false,
    vueI18n: "i18n.config.ts",
  },

  runtimeConfig: {
    public: {
      apiBase: "http://localhost:3001",
    },
  },
});
