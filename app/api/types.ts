import type { $Fetch } from 'ofetch';

/**
 * Injected HTTP client for API modules.
 *
 * Pass **`authenticatedApi`** from `useAuthenticatedApi()` for app calls (Bearer + 401 refresh),
 * or **`$fetch.create({ baseURL: '/api', credentials: 'include' })`** (and optional headers) for
 * unauthenticated routes — paths in request functions stay relative to `/api`.
 */
export type ApiClient = $Fetch;
