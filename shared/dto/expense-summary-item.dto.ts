/**
 * One grouped summary row — mirrors backend `ExpenseSummaryItemDto`.
 */
export interface ExpenseSummaryItemDto {
  type: string;
  recordsCount: number;
  totalAmount: string;
}
