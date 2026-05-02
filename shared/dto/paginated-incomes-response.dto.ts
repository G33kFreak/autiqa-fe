import type { IncomeDto } from './income.dto';
import type { PaginationMetaDto } from './pagination-meta.dto';

/**
 * Paginated incomes list — mirrors backend `PaginatedIncomesResponseDto`.
 */
export interface PaginatedIncomesResponseDto {
  meta: PaginationMetaDto;
  data: IncomeDto[];
}
