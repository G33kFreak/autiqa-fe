import { defineStore } from 'pinia';
import type {
  CreateLedgerEntryDto,
  LedgerCategory,
  LedgerDirection,
  LedgerEntryDto,
} from '#shared/dto/ledger-entry.dto';
import type { CreateExpenseDto, ExpenseDto } from '#shared/dto/expense.dto';
import type { CreateIncomeDto, IncomeDto } from '#shared/dto/income.dto';
import {
  createExpense,
  deleteExpense,
  getCarExpenses,
  updateExpense,
} from '../api/expenses';
import {
  createIncome,
  deleteIncome,
  getCarIncomes,
  updateIncome,
} from '../api/incomes';

/**
 * Unified per-car money ledger. The backend keeps income and expenses on two
 * sibling endpoints (`/incomes`, `/expenses`); this store folds them into one
 * `LedgerEntryDto` timeline so the detail screen stays direction-agnostic, and
 * routes each write back to the correct endpoint by `direction`.
 *
 * Mapping: the backend `type` carries the category; the user's free text lives
 * in `notes` (mirrored into the required `title`). `carPaymentKind` is an
 * expense-only backend concern the UI doesn't surface.
 */

// The backend types are uppercase enums; the FE categories are lowercase keys.
// These maps are the single seam between the two vocabularies.
const EXPENSE_TYPE_TO_CATEGORY: Record<string, LedgerCategory> = {
  MAINTENANCE: 'maintenance',
  CAR_PAYMENT: 'car_payment',
  INSURANCE: 'insurance',
  FEE: 'fee',
  OTHER: 'expense_other',
};
const EXPENSE_CATEGORY_TO_TYPE: Partial<Record<LedgerCategory, string>> = {
  maintenance: 'MAINTENANCE',
  car_payment: 'CAR_PAYMENT',
  insurance: 'INSURANCE',
  fee: 'FEE',
  expense_other: 'OTHER',
};
const INCOME_TYPE_TO_CATEGORY: Record<string, LedgerCategory> = {
  RENTAL: 'rental',
  FARE: 'fare',
  DEPOSIT: 'deposit',
  OTHER: 'income_other',
};
const INCOME_CATEGORY_TO_TYPE: Partial<Record<LedgerCategory, string>> = {
  rental: 'RENTAL',
  fare: 'FARE',
  deposit: 'DEPOSIT',
  income_other: 'OTHER',
};

function expenseToEntry(carId: string, e: ExpenseDto): LedgerEntryDto {
  return {
    id: e.id,
    carId: e.carId ?? carId,
    direction: 'expense',
    category: EXPENSE_TYPE_TO_CATEGORY[e.type] ?? 'expense_other',
    amount: e.amount,
    currency: e.currency,
    occurredAt: e.occurredAt,
    note: e.notes,
    driverId: e.driverId,
    createdAt: e.createdAt,
  };
}

function incomeToEntry(carId: string, i: IncomeDto): LedgerEntryDto {
  return {
    id: i.id,
    carId: i.carId ?? carId,
    direction: 'income',
    category: INCOME_TYPE_TO_CATEGORY[i.type] ?? 'income_other',
    amount: i.amount,
    currency: i.currency,
    occurredAt: i.occurredAt,
    note: i.notes,
    driverId: i.driverId,
    createdAt: i.createdAt,
  };
}

/** Shared write mapping — income and expense bodies are structurally identical. */
function toApiBody(
  carId: string,
  body: CreateLedgerEntryDto,
): CreateExpenseDto & CreateIncomeDto {
  const note = body.note?.trim() || undefined;
  const type =
    body.direction === 'income'
      ? INCOME_CATEGORY_TO_TYPE[body.category] ?? 'OTHER'
      : EXPENSE_CATEGORY_TO_TYPE[body.category] ?? 'OTHER';
  return {
    type,
    amount: body.amount,
    currency: body.currency,
    occurredAt: body.occurredAt,
    // `title` is required upstream but unused by our UI — fall back to the
    // type so the field is always populated; `notes` holds the real text.
    title: note ?? type,
    notes: note ?? null,
    carId,
    driverId: body.driverId ?? null,
  };
}

export const useLedgerStore = defineStore('ledger', () => {
  const { authenticatedApi: api } = useApi();

  async function list(carId: string): Promise<LedgerEntryDto[]> {
    const [expenses, incomes] = await Promise.all([
      getCarExpenses(api, carId),
      getCarIncomes(api, carId),
    ]);
    return [
      ...expenses.data.map((e) => expenseToEntry(carId, e)),
      ...incomes.data.map((i) => incomeToEntry(carId, i)),
    ].sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );
  }

  async function create(
    carId: string,
    body: CreateLedgerEntryDto,
  ): Promise<LedgerEntryDto[]> {
    const apiBody = toApiBody(carId, body);
    if (body.direction === 'income') await createIncome(api, apiBody);
    else await createExpense(api, apiBody);
    return list(carId);
  }

  async function update(
    carId: string,
    entryId: string,
    body: CreateLedgerEntryDto,
  ): Promise<LedgerEntryDto[]> {
    const apiBody = toApiBody(carId, body);
    if (body.direction === 'income') await updateIncome(api, entryId, apiBody);
    else await updateExpense(api, entryId, apiBody);
    return list(carId);
  }

  async function remove(
    carId: string,
    entryId: string,
    direction: LedgerDirection,
  ): Promise<LedgerEntryDto[]> {
    if (direction === 'income') await deleteIncome(api, entryId);
    else await deleteExpense(api, entryId);
    return list(carId);
  }

  return { list, create, update, remove };
});
