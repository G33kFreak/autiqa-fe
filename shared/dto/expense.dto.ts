/**
 * A vehicle expense — mirrors the backend `ExpenseDto`. Money out.
 *
 * `type` is the expense category; `title` / `notes` are free text. Dates are
 * ISO 8601 strings, amounts positive decimal strings. The client folds this
 * (together with `IncomeDto`) into a single `LedgerEntryDto` so the detail
 * screen reads one timeline regardless of which endpoint a row came from.
 */
export interface ExpenseDto {
  id: string;
  organizationId: string;
  type: string;
  amount: string;
  currency: string;
  occurredAt: string;
  title: string | null;
  notes: string | null;
  carPaymentKind: string | null;
  carId: string | null;
  driverId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Body for `POST` / `PATCH` on `/expenses`. */
export interface CreateExpenseDto {
  type: string;
  amount: string;
  currency?: string;
  occurredAt: string;
  title?: string;
  notes?: string | null;
  carId?: string | null;
  driverId?: string | null;
}
