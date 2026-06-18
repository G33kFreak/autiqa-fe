# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # dev server at http://localhost:3000
npm run build      # production build
npm run preview    # preview the production build
npx eslint .       # lint (no npm script; @nuxt/eslint is configured)
```

No test suite is present. `nuxt prepare` runs automatically via `postinstall`.

## Environment

Copy `.env.example` to `.env`. One variable matters for local dev:

```
NUXT_PUBLIC_API_BASE=http://localhost:3001   # external REST API origin (no trailing slash)
```

## Architecture

This is a **Nuxt 4** app (`compatibilityDate: '2025-07-15'`). The Nuxt 4 convention puts all app source under `app/` rather than the root.

### Directory layout

```
app/
  pages/         # file-based routing
  layouts/       # default.vue (no chrome), dashboard.vue (app shell)
  components/    # auto-imported; namespaced by folder (app/, auth/, fleet/, etc.)
  composables/   # auto-imported
  stores/        # Pinia stores, auto-imported
  api/           # typed fetch wrappers (one file per domain: cars.ts, drivers.ts, …)
  assets/css/    # global design tokens and component stylesheets
  middleware/    # numbered global middleware (execution order = filename prefix)
  utils/         # non-auto-imported helpers
server/
  api/auth/      # Nitro BFF routes that proxy auth to the external API
  utils/         # auth-proxy.ts — cookie management and error forwarding helpers
shared/
  dto/           # TypeScript DTOs shared between client and server (#shared/* alias)
i18n/locales/    # pl.json (default), en.json
```

### API layer (`useApi()`)

`app/composables/useApi.ts` exposes three `$fetch` instances:

| Client | Use for |
|---|---|
| `api` | Unauthenticated requests to `NUXT_PUBLIC_API_BASE` |
| `nuxtApi` | Same-origin Nitro routes (`/api/*`) — auth BFF |
| `authenticatedApi` | All authenticated app requests — adds `Bearer` header, auto-retries once after a 401 by calling `authStore.refresh()` |

All API modules in `app/api/` accept an `ApiClient` (`$Fetch`) as their first argument so they're portable across these clients.

### Auth flow

- **Access token** lives in `useAuthStore` (in-memory ref). Never stored in localStorage/cookies.
- **Refresh token** is an `httpOnly` cookie set exclusively by the Nitro BFF (`server/api/auth/`), scoped to the `/api/auth/refresh` path.
- The BFF proxies `login`, `register`, `logout`, `refresh`, and `reset-password` to the external API, strips the refresh token from the upstream response, and sets/clears the cookie.
- `authenticatedApi` intercepts 401s, calls `authStore.refresh()` (which hits the BFF), and replays the original request. Concurrent 401s share a single in-flight refresh promise.

### Middleware chain

Three global middlewares run in order (numbered filename prefix):

1. `01.auth.global.ts` — redirects unauthenticated users to `/login`; redirects authenticated users away from auth pages
2. `02.verify-email.global.ts` — gates `/app/**` on `user.isActive`; redirects to `/app/verify-email` if inactive
3. `03.organization.global.ts` — gates `/app/**` on having an organization; redirects to `/app/onboarding-org` if none

### Layout routing

`routeRules` in `nuxt.config.ts` assigns `appLayout: 'dashboard'` to all `/app/**` routes. The `dashboard` layout wraps content in `<LayoutAppShell>`. All other routes use `default.vue` (no chrome). Two `/app` routes bypass the dashboard layout: `verify-email` and `onboarding-org` (`appLayout: false`).

### Stores

All Pinia stores use the composition API style. The `useLazyViewModel` composable (`app/composables/useLazyViewModel.ts`) is the standard pattern for "fetch once and cache" resources — it dedupes concurrent calls and exposes `getViewModel()` / `setLoaded()` / `reset()`. Use it in stores rather than component-level fetching.

### i18n

- Polish is the default locale (no URL prefix). English uses `/en/` prefix.
- `@nuxtjs/i18n` with `strategy: 'prefix_except_default'`.
- `stripLocalePrefix` (`app/utils/strip-locale-prefix.ts`) is used in middleware to normalize paths before comparison.
- All user-facing strings go in `i18n/locales/pl.json` and `en.json`.

### CSS / design tokens

All CSS custom properties are defined in `app/assets/css/main.css` and imported globally. Component-specific stylesheets (`app.css`, `auth.css`, `inputs.css`, `app-dialog.css`) are imported from `main.css`. Use CSS variables for all colors, radii, and motion values — never hard-code values that exist as tokens.

Icons are **Material Symbols Outlined** (loaded as a Google Fonts variable font). Use the `<span class="material-symbols-outlined">` pattern. Charts use Apache ECharts via `vue-echarts`; the client-only plugin is at `app/plugins/echarts.client.ts`.

### Design system

`DESIGN.md` at the repo root is the canonical visual spec (seed — re-run `/impeccable document` once real CSS tokens exist). `PRODUCT.md` is the strategic brief. The `.cursor/rules/design.mdc` file is from v1 and is **superseded** by these documents; do not follow it.

The current design direction: deep navy primary accent, Lora serif display + Inter body, restrained cool-neutral surfaces (Stripe/Mercury reference). See `DESIGN.md` for the full spec.
