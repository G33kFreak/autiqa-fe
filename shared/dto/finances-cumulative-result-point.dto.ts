/**
 * Monthly cumulative P/L point — mirrors backend `FinancesCumulativeResultPointDto`.
 */
export interface FinancesCumulativeResultPointDto {
  date: string;
  actualValue: number | null;
  projectedValue: number | null;
}
