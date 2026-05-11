import type { PaginationQueryDto } from './pagination-query.dto';

/**
 * Drivers list query params — extends generic pagination with optional name search
 * and optional `isAssigned` (inherited from `PaginationQueryDto`).
 */
export interface DriversPaginationQueryDto extends PaginationQueryDto {
  search?: string;
}
