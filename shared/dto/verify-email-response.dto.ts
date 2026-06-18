/**
 * Success payload for `/auth/verify-email` and `/auth/resend-verification`.
 * Mirrors backend `VerifyEmailResponseDto`.
 */
export interface VerifyEmailResponseDto {
  success: boolean;
}
