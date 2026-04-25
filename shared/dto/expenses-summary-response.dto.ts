import type { ExpenseSummaryItemDto } from './expense-summary-item.dto';

/**
 * Expenses summary payload — mirrors backend `ExpensesSummaryResponseDto`.
 */
export interface ExpensesSummaryResponseDto {
  items: ExpenseSummaryItemDto[];
}
