import type { ApiClient } from './types';
import type { CarDto } from '~~/shared/dto/car.dto';
import type { CreateCarDto } from '~~/shared/dto/create-car.dto';
import type { CreateCarsBatchDto } from '~~/shared/dto/create-cars-batch.dto';
import type { PaginationQueryDto } from '~~/shared/dto/pagination-query.dto';
import type { PaginatedCarsResponseDto } from '~~/shared/dto/paginated-cars-response.dto';

export function getCars(client: ApiClient, query: PaginationQueryDto) {
  return client<PaginatedCarsResponseDto>('/cars', {
    method: 'GET',
    query,
  });
}

export function getCarById(client: ApiClient, id: string) {
  return client<CarDto>(`/cars/${id}`, {
    method: 'GET',
  });
}

/** Batch create: body `{ cars: CreateCarDto[] }` with at least one item; returns created cars in order. */
export function createCarsBatch(client: ApiClient, body: CreateCarsBatchDto) {
  return client<CarDto[]>('/cars', {
    method: 'POST',
    body,
  });
}

/** PATCH `/cars/:id` body — currently reuses backend-compatible `CreateCarDto` shape. */
export function updateCar(client: ApiClient, id: string, body: CreateCarDto) {
  return client<CarDto>(`/cars/${id}`, {
    method: 'PATCH',
    body,
  });
}

export function assignDriverToCar(
  client: ApiClient,
  carId: string,
  driverId: string,
) {
  return client<CarDto>(`/cars/${carId}/driver/${driverId}`, {
    method: 'POST',
  });
}
