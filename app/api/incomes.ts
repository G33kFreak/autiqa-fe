import type { ApiClient } from './types';
import type { PaginationMetaDto } from '#shared/dto/pagination-meta.dto';
import type { CreateIncomeDto, IncomeDto } from '#shared/dto/income.dto';

interface PaginatedIncomesResponse {
  meta: PaginationMetaDto;
  data: IncomeDto[];
}

/** List a car's incomes. One generous page covers a single vehicle. */
export function getCarIncomes(client: ApiClient, carId: string) {
  return client<PaginatedIncomesResponse>('/incomes', {
    method: 'GET',
    query: { carId, page: 1, limit: 100 },
  });
}

export function createIncome(client: ApiClient, body: CreateIncomeDto) {
  return client<IncomeDto>('/incomes', { method: 'POST', body });
}

export function updateIncome(
  client: ApiClient,
  id: string,
  body: CreateIncomeDto,
) {
  return client<IncomeDto>(`/incomes/${id}`, { method: 'PATCH', body });
}

export function deleteIncome(client: ApiClient, id: string) {
  return client<unknown>(`/incomes/${id}`, { method: 'DELETE' });
}
