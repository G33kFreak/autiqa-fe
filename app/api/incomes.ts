import type { ApiClient } from './types';
import type { CreateIncomeDto } from '~~/shared/dto/create-income.dto';
import type { IncomeDto } from '~~/shared/dto/income.dto';
import type { ListIncomesQueryDto } from '~~/shared/dto/list-incomes-query.dto';
import type { PaginatedIncomesResponseDto } from '~~/shared/dto/paginated-incomes-response.dto';

export function getIncomes(client: ApiClient, query: ListIncomesQueryDto) {
  return client<PaginatedIncomesResponseDto>('/incomes', {
    method: 'GET',
    query,
  });
}

export function createIncome(client: ApiClient, body: CreateIncomeDto) {
  return client<IncomeDto>('/incomes', {
    method: 'POST',
    body,
  });
}

export function updateIncome(client: ApiClient, id: string, body: CreateIncomeDto) {
  return client<IncomeDto>(`/incomes/${id}`, {
    method: 'PATCH',
    body,
  });
}

export function deleteIncome(client: ApiClient, id: string) {
  return client<unknown>(`/incomes/${id}`, {
    method: 'DELETE',
  });
}
