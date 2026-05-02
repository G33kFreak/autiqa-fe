import type { ApiClient } from './types';
import type { FinancesCarsRatingsResponseDto } from '~~/shared/dto/finances-cars-ratings-response.dto';
import type { FinancesCumulativeResultPointDto } from '~~/shared/dto/finances-cumulative-result-point.dto';
import type { FinancesDateRangeQueryDto } from '~~/shared/dto/finances-date-range-query.dto';
import type { FinancesExpenseStructureItemDto } from '~~/shared/dto/finances-expense-structure-item.dto';
import type { FinancesSummaryResponseDto } from '~~/shared/dto/finances-summary-response.dto';
import type { FinancesTrendPointDto } from '~~/shared/dto/finances-trend-point.dto';

export function getFinancesSummary(client: ApiClient, query: FinancesDateRangeQueryDto) {
  return client<FinancesSummaryResponseDto>('/finances/summary', {
    method: 'GET',
    query,
  });
}

export function getFinancesTrend(client: ApiClient, query: FinancesDateRangeQueryDto) {
  return client<FinancesTrendPointDto[]>('/finances/trend', {
    method: 'GET',
    query,
  });
}

export function getFinancesExpensesStructure(
  client: ApiClient,
  query: FinancesDateRangeQueryDto,
) {
  return client<FinancesExpenseStructureItemDto[]>('/finances/expenses-structure', {
    method: 'GET',
    query,
  });
}

export function getFinancesCumulativeResult(client: ApiClient) {
  return client<FinancesCumulativeResultPointDto[]>('/finances/cumulative-result', {
    method: 'GET',
  });
}

export function getFinancesCarsRatings(client: ApiClient, query: FinancesDateRangeQueryDto) {
  return client<FinancesCarsRatingsResponseDto>('/finances/cars-ratings', {
    method: 'GET',
    query,
  });
}
