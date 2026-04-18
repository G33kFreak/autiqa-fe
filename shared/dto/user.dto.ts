/**
 * Public user from the API — mirrors backend `UserDto`.
 * Dates are ISO 8601 strings in JSON responses.
 */
export interface UserDto {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
