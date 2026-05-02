/**
 * Finances KPI summary — mirrors backend `FinancesSummaryResponseDto`.
 */
export interface FinancesSummaryResponseDto {
  totalSpend: number;
  avgDailySpend: number;
  totalRevenue: number;
  avgDailyRevenue: number;
  totalProfitLoss: number;
  avgDailyProfitLoss: number;
}
