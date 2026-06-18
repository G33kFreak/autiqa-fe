import type { JwtTokensDto } from '#shared/dto/jwt-tokens.dto';
import type { LoginDto } from '#shared/dto/login.dto';
import type { RegisterDto } from '#shared/dto/register.dto';
import type { RegisterResponseDto } from '#shared/dto/register-response.dto';
import type { SessionResponseDto } from '#shared/dto/session-response.dto';
import type { VerifyEmailDto } from '#shared/dto/verify-email.dto';
import type { VerifyEmailResponseDto } from '#shared/dto/verify-email-response.dto';
import type { ApiClient } from './types';

export function registerAccount(client: ApiClient, body: RegisterDto) {
  return client<RegisterResponseDto>('/auth/register', {
    method: 'POST',
    body,
  });
}

export function login(client: ApiClient, body: LoginDto) {
  return client<SessionResponseDto>('/auth/login', {
    method: 'POST',
    body,
  });
}

/** Clears httpOnly refresh cookie (same-origin `/api`). */
export function logoutSession(client: ApiClient) {
  return client<{ ok: true }>('/auth/logout', {
    method: 'POST',
  });
}

/** Cookie-based refresh; call with `credentials: 'include'` on your `ApiClient`. */
export function refreshSession(client: ApiClient) {
  return client<JwtTokensDto>('/auth/refresh', {
    method: 'POST',
  });
}

/**
 * Confirm the email OTP. Authenticated call — the access token identifies the
 * user, so only the code is sent. Pass `authenticatedApi`.
 */
export function verifyEmail(client: ApiClient, body: VerifyEmailDto) {
  return client<VerifyEmailResponseDto>('/auth/verify-email', {
    method: 'POST',
    body,
  });
}

/** Re-send the email OTP to the signed-in user. Pass `authenticatedApi`. */
export function resendVerification(client: ApiClient) {
  return client<VerifyEmailResponseDto>('/auth/resend-verification', {
    method: 'POST',
  });
}
