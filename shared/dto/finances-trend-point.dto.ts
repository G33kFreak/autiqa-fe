/**
 * Daily finances trend point — mirrors backend `FinancesTrendPointDto`.
 */
export interface FinancesTrendPointDto {
  date: string;
  spendValue: number;
  revenueValue: number;
  profitLossValue: number;
}
