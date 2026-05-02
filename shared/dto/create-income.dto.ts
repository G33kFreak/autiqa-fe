/**
 * Create / update income payload — mirrors backend `CreateIncomeDto` (also used for PATCH).
 */
export interface CreateIncomeDto {
  amount: string;
  currency?: string;
  occurredAt: string;
  title?: string;
  notes?: string;
  carId: string;
  driverId: string;
}
