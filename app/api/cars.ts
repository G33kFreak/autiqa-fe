import type { ApiClient } from './types';
import type { CarDto } from '~~/shared/dto/car.dto';
import type { CreateCarDto } from '~~/shared/dto/create-car.dto';
import type { PaginationQueryDto } from '~~/shared/dto/pagination-query.dto';
import type { PaginatedCarsResponseDto } from '~~/shared/dto/paginated-cars-response.dto';

export function getCars(client: ApiClient, query: PaginationQueryDto) {
  return client<PaginatedCarsResponseDto>('/cars', {
    method: 'GET',
    query,
  });
}

export function createCar(client: ApiClient, body: CreateCarDto) {
  return client<CarDto>('/cars', {
    method: 'POST',
    body,
  });
}
