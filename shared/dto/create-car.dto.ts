/**
 * POST `/cars` body — mirrors backend `CreateCarDto`.
 */
export interface CreateCarDto {
  model: string;
  vin?: string;
  plateNumber?: string;
  assignedDriverId?: string;
  inspectionValidUntil?: string;
  insuranceValidUntil?: string;
}
