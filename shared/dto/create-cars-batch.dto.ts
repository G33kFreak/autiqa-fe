import type { CreateCarDto } from './create-car.dto';

/**
 * POST `/cars` body — batch create (mirrors backend `CreateCarsBatchDto`).
 */
export interface CreateCarsBatchDto {
  cars: CreateCarDto[];
}
