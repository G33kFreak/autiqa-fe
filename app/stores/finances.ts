import { defineStore } from 'pinia';
import type { FinancesCarsRatingsResponseDto } from '#shared/dto/finances-cars-ratings-response.dto';
import type { FinancesCumulativeResultPointDto } from '#shared/dto/finances-cumulative-result-point.dto';
import type { FinancesExpenseStructureItemDto } from '#shared/dto/finances-expense-structure-item.dto';
import type { FinancesSummaryResponseDto } from '#shared/dto/finances-summary-response.dto';
import type { FinancesTrendPointDto } from '#shared/dto/finances-trend-point.dto';
import {
  getFinancesCarsRatings,
  getFinancesCumulativeResult,
  getFinancesExpensesStructure,
  getFinancesSummary,
  getFinancesTrend,
} from '../api/finances';

export const useFinancesStore = defineStore('finances', () => {
  const { authenticatedApi } = useApi();

  const summary = ref<FinancesSummaryResponseDto | null>(null);
  const trend = ref<FinancesTrendPointDto[]>([]);
  const expenseStructure = ref<FinancesExpenseStructureItemDto[]>([]);
  const cumulativeResult = ref<FinancesCumulativeResultPointDto[]>([]);
  const carsRatings = ref<FinancesCarsRatingsResponseDto | null>(null);
  const loading = ref(false);

  async function fetchDashboard(from: string, to: string): Promise<void> {
    const query = { from, to };
    loading.value = true;
    try {
      const [summaryRes, trendRes, structureRes, cumulativeRes, carsRes] = await Promise.all([
        getFinancesSummary(authenticatedApi, query),
        getFinancesTrend(authenticatedApi, query),
        getFinancesExpensesStructure(authenticatedApi, query),
        getFinancesCumulativeResult(authenticatedApi),
        getFinancesCarsRatings(authenticatedApi, query),
      ]);
      summary.value = summaryRes;
      trend.value = trendRes;
      expenseStructure.value = structureRes;
      cumulativeResult.value = cumulativeRes;
      carsRatings.value = carsRes;
    } finally {
      loading.value = false;
    }
  }

  return {
    summary,
    trend,
    expenseStructure,
    cumulativeResult,
    carsRatings,
    loading,
    fetchDashboard,
  };
});
