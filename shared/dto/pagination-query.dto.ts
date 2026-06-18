/**
 * Query params for paginated list endpoints — mirrors backend `PaginationQueryDto`.
 */
export interface PaginationQueryDto {
  page: number;
  limit: number;
}
