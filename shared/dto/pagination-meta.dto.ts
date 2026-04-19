/**
 * Pagination metadata — mirrors backend `PaginationMetaDto`.
 */
export interface PaginationMetaDto {
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
