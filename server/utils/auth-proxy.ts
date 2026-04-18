import {
  createError,
  deleteCookie,
  getCookie,
  getRequestURL,
  setCookie,
  type H3Event,
} from 'h3';
import { FetchError } from 'ofetch';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export const REFRESH_COOKIE_NAME = 'refresh_token';

const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const REFRESH_COOKIE_PATH = '/api/auth/refresh';

export function restApiUrl(event: H3Event, path: string): string {
  const base = String(useRuntimeConfig(event).public.apiBase ?? '').replace(
    /\/$/,
    '',
  );
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function setRefreshTokenCookie(event: H3Event, refreshToken: string) {
  setCookie(event, REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: getRequestURL(event).protocol === 'https:',
    sameSite: 'strict',
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

export function clearRefreshTokenCookie(event: H3Event) {
  deleteCookie(event, REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
}

export function getRefreshTokenFromCookie(event: H3Event): string | undefined {
  return getCookie(event, REFRESH_COOKIE_NAME);
}

/** Forward upstream 4xx; otherwise BAD_GATEWAY. */
export function throwUpstreamAuthError(cause: unknown): never {
  if (cause instanceof FetchError) {
    const status = cause.status ?? cause.statusCode;
    if (
      status != null &&
      status >= StatusCodes.BAD_REQUEST &&
      status < StatusCodes.INTERNAL_SERVER_ERROR
    ) {
      throw createError({
        statusCode: status,
        statusMessage:
          cause.statusText || cause.statusMessage || cause.message,
      });
    }
  }
  throw createError({
    statusCode: StatusCodes.BAD_GATEWAY,
    statusMessage: ReasonPhrases.BAD_GATEWAY,
    cause,
  });
}
