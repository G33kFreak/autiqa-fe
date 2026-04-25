/**
 * Expense from the API — mirrors backend `ExpenseDto`.
 * Dates are ISO 8601 strings in JSON responses.
 */
export interface ExpenseDto {
  id: string;
  organizationId: string;
  type: string;
  amount: string;
  currency: string;
  occurredAt: string;
  title: string;
  notes: string | null;
  carPaymentKind: string | null;
  carId: string | null;
  driverId: string | null;
  createdAt: string;
  updatedAt: string;
}
