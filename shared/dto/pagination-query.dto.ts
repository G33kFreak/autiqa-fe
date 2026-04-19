/**
 * Query params for paginated list endpoints — mirrors backend `PaginationQueryDto`.
 * Apply the same defaults as the API when building requests (`page` / `limit`).
 */
export interface PaginationQueryDto {
  page: number;
  limit: number;
}
