import type { PaginationQueryDto } from './pagination-query.dto';

/**
 * Incomes list query params — extends pagination with optional car/driver filters.
 */
export interface ListIncomesQueryDto extends PaginationQueryDto {
  carId?: string;
  driverId?: string;
}
