import { defineStore } from 'pinia';
import type { CreateExpenseDto } from '#shared/dto/create-expense.dto';
import type { ExpenseDto } from '#shared/dto/expense.dto';
import type { ExpensesSummaryQueryDto } from '#shared/dto/expenses-summary-query.dto';
import type { ExpensesSummaryResponseDto } from '#shared/dto/expenses-summary-response.dto';
import type { ListExpensesQueryDto } from '#shared/dto/list-expenses-query.dto';
import type { PaginatedExpensesResponseDto } from '#shared/dto/paginated-expenses-response.dto';
import {
  createExpense as createExpenseRequest,
  getExpensesSummary,
  getExpenses,
} from '../api/expenses';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export const useExpensesStore = defineStore('expenses', () => {
  const { authenticatedApi } = useApi();
  const creating = ref(false);

  /**
   * Stateless fetch helper with sensible defaults.
   */
  async function fetchExpenses(
    query: Partial<ListExpensesQueryDto> = {},
  ): Promise<PaginatedExpensesResponseDto> {
    return await getExpenses(authenticatedApi, {
      page: query.page ?? DEFAULT_PAGE,
      limit: query.limit ?? DEFAULT_LIMIT,
      carId: query.carId,
      driverId: query.driverId,
      type: query.type,
    });
  }

  /**
   * Explicit full-query helper.
   */
  async function getExpensesByQuery(
    query: ListExpensesQueryDto,
  ): Promise<PaginatedExpensesResponseDto> {
    return await getExpenses(authenticatedApi, query);
  }

  async function fetchExpensesSummary(
    query: ExpensesSummaryQueryDto = {},
  ): Promise<ExpensesSummaryResponseDto> {
    return await getExpensesSummary(authenticatedApi, query);
  }

  async function createExpense(payload: CreateExpenseDto): Promise<ExpenseDto> {
    creating.value = true;
    try {
      return await createExpenseRequest(authenticatedApi, payload);
    } finally {
      creating.value = false;
    }
  }

  return {
    creating,
    fetchExpenses,
    getExpensesByQuery,
    fetchExpensesSummary,
    createExpense,
  };
});
