import type { DriverDto } from './driver.dto';

/**
 * Car from the API — mirrors backend `CarDto`.
 * Dates are ISO 8601 strings in JSON responses.
 */
export interface CarDto {
  id: string;
  organizationId: string;
  model: string;
  vin: string | null;
  plateNumber: string | null;
  driver: DriverDto | null;
  inspectionValidUntil: string | null;
  createdAt: string;
  updatedAt: string;
}
