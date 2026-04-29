import { defineStore } from 'pinia';
import type { CreateExpenseDto } from '#shared/dto/create-expense.dto';
import type { ExpenseDto } from '#shared/dto/expense.dto';
import type { ExpensesSummaryQueryDto } from '#shared/dto/expenses-summary-query.dto';
import type { ExpensesSummaryResponseDto } from '#shared/dto/expenses-summary-response.dto';
import type { ListExpensesQueryDto } from '#shared/dto/list-expenses-query.dto';
import type { PaginatedExpensesResponseDto } from '#shared/dto/paginated-expenses-response.dto';
import {
  createExpense as createExpenseRequest,
  deleteExpense as deleteExpenseRequest,
  getExpensesSummary,
  getExpenses,
  updateExpense as updateExpenseRequest,
} from '../api/expenses';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export const useExpensesStore = defineStore('expenses', () => {
  const { authenticatedApi } = useApi();
  const creating = ref(false);
  const updating = ref(false);
  const deleting = ref(false);

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

  async function updateExpense(id: string, payload: CreateExpenseDto): Promise<ExpenseDto> {
    updating.value = true;
    try {
      return await updateExpenseRequest(authenticatedApi, id, payload);
    } finally {
      updating.value = false;
    }
  }

  async function deleteExpense(id: string): Promise<void> {
    deleting.value = true;
    try {
      await deleteExpenseRequest(authenticatedApi, id);
    } finally {
      deleting.value = false;
    }
  }

  return {
    creating,
    updating,
    deleting,
    fetchExpenses,
    getExpensesByQuery,
    fetchExpensesSummary,
    createExpense,
    updateExpense,
    deleteExpense,
  };
});
