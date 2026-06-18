/**
 * POST register body — mirrors backend `RegisterDto`.
 */
export interface RegisterDto {
  email: string;
  name: string;
  password: string;
}
