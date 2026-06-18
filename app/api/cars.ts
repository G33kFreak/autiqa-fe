import type { ApiClient } from './types';
import type { CarDto } from '#shared/dto/car.dto';
import type { CreateCarDto } from '#shared/dto/create-car.dto';
import type { CreateCarsBatchDto } from '#shared/dto/create-cars-batch.dto';
import type { PaginationQueryDto } from '#shared/dto/pagination-query.dto';
import type { PaginatedCarsResponseDto } from '#shared/dto/paginated-cars-response.dto';

/** List cars for the current organization. */
export function getCars(client: ApiClient, query: PaginationQueryDto) {
  return client<PaginatedCarsResponseDto>('/cars', {
    method: 'GET',
    query,
  });
}

/** Batch create (`{ cars: CreateCarDto[] }`); returns the created cars in order. */
export function createCarsBatch(client: ApiClient, body: CreateCarsBatchDto) {
  return client<CarDto[]>('/cars', {
    method: 'POST',
    body,
  });
}

/** Create a single car — a one-item batch against `POST /cars`. */
export async function createCar(
  client: ApiClient,
  car: CreateCarDto,
): Promise<CarDto> {
  const [created] = await createCarsBatch(client, { cars: [car] });
  if (!created) throw new Error('Car creation returned an empty response.');
  return created;
}
