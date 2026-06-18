import type { DriverDto } from './driver.dto';

/**
 * Car from the API — mirrors backend `CarDto`.
 * Dates are ISO 8601 strings in JSON responses.
 *
 * Every field here ships in the list response, so the Fleet table renders from
 * `GET /cars` alone — no per-vehicle detail request needed for the overview.
 */
export interface CarDto {
  id: string;
  organizationId: string;
  model: string;
  vin: string | null;
  plateNumber: string | null;
  driver: DriverDto | null;
  /** Technical inspection valid-until date, when known. */
  inspectionValidUntil: string | null;
  /** Insurance policy (OC/AC) valid-until date, when known. */
  insuranceValidUntil: string | null;
  createdAt: string;
  updatedAt: string;
}
