import type { ApiClient } from './types';
import type { CreateExpenseDto } from '~~/shared/dto/create-expense.dto';
import type { ExpenseDto } from '~~/shared/dto/expense.dto';
import type { ExpensesSummaryQueryDto } from '~~/shared/dto/expenses-summary-query.dto';
import type { ExpensesSummaryResponseDto } from '~~/shared/dto/expenses-summary-response.dto';
import type { ListExpensesQueryDto } from '~~/shared/dto/list-expenses-query.dto';
import type { PaginatedExpensesResponseDto } from '~~/shared/dto/paginated-expenses-response.dto';

export function getExpenses(client: ApiClient, query: ListExpensesQueryDto) {
  return client<PaginatedExpensesResponseDto>('/expenses', {
    method: 'GET',
    query,
  });
}

export function createExpense(client: ApiClient, body: CreateExpenseDto) {
  return client<ExpenseDto>('/expenses', {
    method: 'POST',
    body,
  });
}

export function updateExpense(client: ApiClient, id: string, body: CreateExpenseDto) {
  return client<ExpenseDto>(`/expenses/${id}`, {
    method: 'PATCH',
    body,
  });
}

export function deleteExpense(client: ApiClient, id: string) {
  return client<unknown>(`/expenses/${id}`, {
    method: 'DELETE',
  });
}

export function getExpensesSummary(
  client: ApiClient,
  query: ExpensesSummaryQueryDto = {},
) {
  return client<ExpensesSummaryResponseDto>('/expenses/summary', {
    method: 'GET',
    query,
  });
}
