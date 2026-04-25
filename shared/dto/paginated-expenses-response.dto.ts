import type { ExpenseDto } from './expense.dto';
import type { PaginationMetaDto } from './pagination-meta.dto';

/**
 * Paginated expenses list — mirrors backend `PaginatedExpensesResponseDto`.
 */
export interface PaginatedExpensesResponseDto {
  meta: PaginationMetaDto;
  data: ExpenseDto[];
}
