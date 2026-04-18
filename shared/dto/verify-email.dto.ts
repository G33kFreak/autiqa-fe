/**
 * POST `/auth/verify-email` body — adjust field name if your API differs (e.g. `otp`).
 */
export interface VerifyEmailDto {
  token: string;
}
