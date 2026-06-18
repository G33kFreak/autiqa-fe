/**
 * A single car in the `POST /cars` body — mirrors backend `CreateCarDto`.
 * Only `model` is required; optional fields are omitted when blank.
 */
export interface CreateCarDto {
  model: string;
  vin?: string;
  plateNumber?: string;
  assignedDriverId?: string;
  /** ISO date (yyyy-mm-dd). */
  inspectionValidUntil?: string;
}
