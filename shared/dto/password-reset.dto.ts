/**
 * POST `/auth/forgot-password` — exactly one of `email` (first send) or
 * `resetRequestToken` (resend). Public, no auth header.
 */
export type ForgotPasswordRequest =
  | { email: string; resetRequestToken?: never }
  | { resetRequestToken: string; email?: never };

/** POST `/auth/forgot-password` success body (200). */
export interface ForgotPasswordResponseDto {
  resetRequestToken: string;
}

/**
 * POST `/auth/reset-password` — preferred: `resetRequestToken` + `code` + `newPassword`.
 * Legacy: `email` + `code` + `newPassword`.
 */
export type ResetPasswordRequest =
  | {
      resetRequestToken: string;
      code: string;
      newPassword: string;
      email?: never;
    }
  | {
      email: string;
      code: string;
      newPassword: string;
      resetRequestToken?: never;
    };
