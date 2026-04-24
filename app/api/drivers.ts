import type { ApiClient } from './types';
import type { DriverDto } from '~~/shared/dto/driver.dto';
import type { CreateDriversBatchDto } from '~~/shared/dto/create-drivers-batch.dto';
import type { DriversPaginationQueryDto } from '~~/shared/dto/drivers-pagination-query.dto';
import type { PaginatedDriversResponseDto } from '~~/shared/dto/paginated-drivers-response.dto';

export function getDrivers(client: ApiClient, query: DriversPaginationQueryDto) {
  return client<PaginatedDriversResponseDto>('/drivers', {
    method: 'GET',
    query,
  });
}

export function createDriversBatch(client: ApiClient, body: CreateDriversBatchDto) {
  return client<DriverDto[]>('/drivers', {
    method: 'POST',
    body,
  });
}
