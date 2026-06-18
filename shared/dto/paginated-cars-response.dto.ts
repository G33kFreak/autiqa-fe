import type { CarDto } from './car.dto';
import type { PaginationMetaDto } from './pagination-meta.dto';

/**
 * Paginated cars list — mirrors backend `PaginatedCarsResponseDto`.
 */
export interface PaginatedCarsResponseDto {
  meta: PaginationMetaDto;
  data: CarDto[];
}
