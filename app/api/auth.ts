import type { JwtTokensDto } from '#shared/dto/jwt-tokens.dto';
import type { LoginDto } from '#shared/dto/login.dto';
import type { RegisterDto } from '#shared/dto/register.dto';
import type { RegisterResponseDto } from '#shared/dto/register-response.dto';
import type { SessionResponseDto } from '#shared/dto/session-response.dto';
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponseDto,
  ResetPasswordRequest,
} from '#shared/dto/password-reset.dto';
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

export function verifyEmail(client: ApiClient, body: VerifyEmailDto) {
  return client<VerifyEmailResponseDto>('/auth/verify-email', {
    method: 'POST',
    body,
  });
}

/** Public BFF — 200 JSON with `resetRequestToken`. */
export function requestForgotPassword(
  client: ApiClient,
  body: ForgotPasswordRequest,
) {
  return client<ForgotPasswordResponseDto>('/auth/forgot-password', {
    method: 'POST',
    body,
  });
}

/** Public BFF — 204 No Content on success. */
export function resetPasswordWithCode(
  client: ApiClient,
  body: ResetPasswordRequest,
) {
  return client<null>('/auth/reset-password', {
    method: 'POST',
    body,
  });
}
