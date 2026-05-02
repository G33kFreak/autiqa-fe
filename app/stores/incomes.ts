import { defineStore } from 'pinia';
import type { CreateIncomeDto } from '#shared/dto/create-income.dto';
import type { IncomeDto } from '#shared/dto/income.dto';
import type { IncomesSummaryQueryDto } from '#shared/dto/incomes-summary-query.dto';
import type { IncomesSummaryResponseDto } from '#shared/dto/incomes-summary-response.dto';
import type { ListIncomesQueryDto } from '#shared/dto/list-incomes-query.dto';
import type { PaginatedIncomesResponseDto } from '#shared/dto/paginated-incomes-response.dto';
import {
  createIncome as createIncomeRequest,
  deleteIncome as deleteIncomeRequest,
  getIncomes,
  getIncomesSummary,
  updateIncome as updateIncomeRequest,
} from '../api/incomes';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export const useIncomesStore = defineStore('incomes', () => {
  const { authenticatedApi } = useApi();
  const creating = ref(false);
  const updating = ref(false);
  const deleting = ref(false);

  /**
   * Stateless fetch helper with sensible defaults.
   */
  async function fetchIncomes(
    query: Partial<ListIncomesQueryDto> = {},
  ): Promise<PaginatedIncomesResponseDto> {
    return await getIncomes(authenticatedApi, {
      page: query.page ?? DEFAULT_PAGE,
      limit: query.limit ?? DEFAULT_LIMIT,
      carId: query.carId,
      driverId: query.driverId,
    });
  }

  /**
   * Explicit full-query helper.
   */
  async function getIncomesByQuery(
    query: ListIncomesQueryDto,
  ): Promise<PaginatedIncomesResponseDto> {
    return await getIncomes(authenticatedApi, query);
  }

  async function fetchIncomesSummary(
    query: IncomesSummaryQueryDto = {},
  ): Promise<IncomesSummaryResponseDto> {
    return await getIncomesSummary(authenticatedApi, query);
  }

  async function createIncome(payload: CreateIncomeDto): Promise<IncomeDto> {
    creating.value = true;
    try {
      return await createIncomeRequest(authenticatedApi, payload);
    } finally {
      creating.value = false;
    }
  }

  async function updateIncome(id: string, payload: CreateIncomeDto): Promise<IncomeDto> {
    updating.value = true;
    try {
      return await updateIncomeRequest(authenticatedApi, id, payload);
    } finally {
      updating.value = false;
    }
  }

  async function deleteIncome(id: string): Promise<void> {
    deleting.value = true;
    try {
      await deleteIncomeRequest(authenticatedApi, id);
    } finally {
      deleting.value = false;
    }
  }

  return {
    creating,
    updating,
    deleting,
    fetchIncomes,
    getIncomesByQuery,
    fetchIncomesSummary,
    createIncome,
    updateIncome,
    deleteIncome,
  };
});
