import type { $Fetch } from 'ofetch';

/**
 * Injected HTTP client for API modules.
 *
 * Pass **`authenticatedApi`** from **`useApi()`** for app calls (Bearer + 401 refresh),
 * **`useApi().nuxtApi`** for same-origin Nitro **`/api/*`**, or **`useApi().api`** for
 * **`runtimeConfig.public.apiBase`** (**`NUXT_PUBLIC_API_BASE`**).
 */
export type ApiClient = $Fetch;
