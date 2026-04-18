/**
 * POST `/auth/login` body — mirrors backend login payload.
 */
export interface LoginDto {
  email: string;
  password: string;
}
