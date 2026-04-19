/**
 * Driver from the API — mirrors backend `DriverDto`.
 * Dates are ISO 8601 strings in JSON responses.
 */
export interface DriverDto {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  email: string | null;
  carId: string | null;
  createdAt: string;
  updatedAt: string;
}
