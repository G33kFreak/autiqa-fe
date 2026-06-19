/**
 * A vehicle income — mirrors the backend `IncomeDto`. Money in.
 *
 * Structurally parallel to `ExpenseDto`: `type` carries the income category,
 * `title` / `notes` are free text. Folded into the unified `LedgerEntryDto` on
 * the client (see ledger-entry.dto.ts).
 */
export interface IncomeDto {
  id: string;
  organizationId: string;
  type: string;
  amount: string;
  currency: string;
  occurredAt: string;
  title: string | null;
  notes: string | null;
  carId: string | null;
  driverId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Body for `POST` / `PATCH` on `/incomes`. */
export interface CreateIncomeDto {
  type: string;
  amount: string;
  currency?: string;
  occurredAt: string;
  title?: string;
  notes?: string | null;
  carId?: string | null;
  driverId?: string | null;
}
