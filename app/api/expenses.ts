import type { ApiClient } from './types';
import type { PaginationMetaDto } from '#shared/dto/pagination-meta.dto';
import type { CreateExpenseDto, ExpenseDto } from '#shared/dto/expense.dto';

interface PaginatedExpensesResponse {
  meta: PaginationMetaDto;
  data: ExpenseDto[];
}

/** List a car's expenses. One generous page covers a single vehicle. */
export function getCarExpenses(client: ApiClient, carId: string) {
  return client<PaginatedExpensesResponse>('/expenses', {
    method: 'GET',
    query: { carId, page: 1, limit: 100 },
  });
}

export function createExpense(client: ApiClient, body: CreateExpenseDto) {
  return client<ExpenseDto>('/expenses', { method: 'POST', body });
}

export function updateExpense(
  client: ApiClient,
  id: string,
  body: CreateExpenseDto,
) {
  return client<ExpenseDto>(`/expenses/${id}`, { method: 'PATCH', body });
}

export function deleteExpense(client: ApiClient, id: string) {
  return client<unknown>(`/expenses/${id}`, { method: 'DELETE' });
}
