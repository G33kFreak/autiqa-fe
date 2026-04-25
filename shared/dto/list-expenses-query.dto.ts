import type { PaginationQueryDto } from './pagination-query.dto';

/**
 * Expenses list query params — extends pagination with optional entity/type filters.
 */
export interface ListExpensesQueryDto extends PaginationQueryDto {
  carId?: string;
  driverId?: string;
  type?: string;
}
