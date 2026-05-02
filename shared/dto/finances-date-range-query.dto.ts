/**
 * GET `/finances/*` date range query — mirrors backend `FinancesDateRangeQueryDto`.
 */
export interface FinancesDateRangeQueryDto {
  from: string;
  to: string;
}
