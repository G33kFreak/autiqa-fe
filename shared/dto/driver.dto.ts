/**
 * Driver from the API — mirrors backend `DriverDto`.
 * Dates are ISO 8601 strings in JSON responses.
 *
 * A car's list response embeds the assigned driver, so the Fleet table can show
 * the driver's name without a second request. The dedicated drivers surface
 * (not built yet) will own creating and editing these records.
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
