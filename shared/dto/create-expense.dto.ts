/**
 * Create expense payload — mirrors backend `CreateExpenseDto`.
 */
export interface CreateExpenseDto {
  type: string;
  amount: string;
  currency?: string;
  occurredAt: string;
  title: string;
  notes?: string;
  carPaymentKind?: string;
  carId?: string;
  driverId?: string;
}
