import type { CreateCarDto } from './create-car.dto';

/**
 * `POST /cars` body — the backend creates in batch and returns the created cars
 * in order. Adding one car at a time simply sends a single-item batch.
 */
export interface CreateCarsBatchDto {
  cars: CreateCarDto[];
}
