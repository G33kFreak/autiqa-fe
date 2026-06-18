import type { DriverDto } from './driver.dto';
import type { PaginationMetaDto } from './pagination-meta.dto';

/**
 * Paginated drivers list — mirrors backend `PaginatedDriversResponseDto`.
 */
export interface PaginatedDriversResponseDto {
  meta: PaginationMetaDto;
  data: DriverDto[];
}
