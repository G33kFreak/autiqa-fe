/**
 * Income from the API — mirrors backend `IncomeDto`.
 * Dates are ISO 8601 strings in JSON responses.
 */
export interface IncomeDto {
  id: string;
  organizationId: string;
  carId: string;
  driverId: string;
  amount: string;
  currency: string;
  occurredAt: string;
  title: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
