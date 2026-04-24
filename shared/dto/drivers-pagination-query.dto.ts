import type { PaginationQueryDto } from './pagination-query.dto';

/**
 * Drivers list query params — extends generic pagination with optional name search.
 */
export interface DriversPaginationQueryDto extends PaginationQueryDto {
  search?: string;
}
