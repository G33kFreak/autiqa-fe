import type { CreateDriverDto } from './create-driver.dto';

/**
 * POST `/drivers` body — batch create (mirrors backend `CreateDriversBatchDto`).
 */
export interface CreateDriversBatchDto {
  drivers: CreateDriverDto[];
}
