/**
 * POST `/auth/verify-email` body — mirrors backend `VerifyEmailDto`.
 * The user is identified by the access token, so only the code travels in the body.
 */
export interface VerifyEmailDto {
  otpCode: string;
}
