/**
 * A single money movement for a vehicle — mirrors the backend `LedgerEntryDto`.
 *
 * One unified ledger replaces the v1 split of incomes, fee-expenses and
 * maintenance-expenses. Every row is a `direction` (money in or out) plus a
 * `category`; per-vehicle economics are derived from the entries, so there is
 * no separate summary endpoint to keep in sync.
 */
export type LedgerDirection = 'income' | 'expense';

/**
 * Categories mirror the backend type enums (uppercase on the wire — e.g.
 * expense `MAINTENANCE`/`CAR_PAYMENT`/`INSURANCE`/`FEE`/`OTHER`). The store maps
 * these lowercase keys to/from those enums; see stores/ledger.ts.
 */
export type LedgerCategory =
  // income
  | 'rental'
  | 'fare'
  | 'deposit'
  | 'income_other'
  // expense
  | 'maintenance'
  | 'car_payment'
  | 'insurance'
  | 'fee'
  | 'expense_other';

export const LEDGER_INCOME_CATEGORIES: readonly LedgerCategory[] = [
  'rental',
  'fare',
  'deposit',
  'income_other',
] as const;

export const LEDGER_EXPENSE_CATEGORIES: readonly LedgerCategory[] = [
  'maintenance',
  'car_payment',
  'insurance',
  'fee',
  'expense_other',
] as const;

export interface LedgerEntryDto {
  id: string;
  carId: string;
  direction: LedgerDirection;
  category: LedgerCategory;
  /** Positive decimal string (e.g. "1499.99"); direction carries the sign. */
  amount: string;
  /** ISO 4217 code. */
  currency: string;
  /** When the money moved (ISO 8601). */
  occurredAt: string;
  note: string | null;
  /** Driver tied to this entry, when relevant (e.g. a fare or a fine). */
  driverId: string | null;
  createdAt: string;
}

/** Body for `POST`/`PATCH` ledger entries. */
export interface CreateLedgerEntryDto {
  direction: LedgerDirection;
  category: LedgerCategory;
  amount: string;
  currency: string;
  occurredAt: string;
  note?: string | null;
  driverId?: string | null;
}
