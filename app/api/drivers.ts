import type { ApiClient } from './types';
import type { DriverDto } from '#shared/dto/driver.dto';
import type { CreateDriverDto } from '#shared/dto/create-driver.dto';
import type { CreateDriversBatchDto } from '#shared/dto/create-drivers-batch.dto';
import type { PaginationQueryDto } from '#shared/dto/pagination-query.dto';
import type { PaginatedDriversResponseDto } from '#shared/dto/paginated-drivers-response.dto';

/** List drivers for the current organization. */
export function getDrivers(client: ApiClient, query: PaginationQueryDto) {
  return client<PaginatedDriversResponseDto>('/drivers', {
    method: 'GET',
    query,
  });
}

/** Batch create (`{ drivers: CreateDriverDto[] }`); returns the created drivers in order. */
export function createDriversBatch(client: ApiClient, body: CreateDriversBatchDto) {
  return client<DriverDto[]>('/drivers', {
    method: 'POST',
    body,
  });
}

/** Create a single driver — a one-item batch against `POST /drivers`. */
export async function createDriver(
  client: ApiClient,
  driver: CreateDriverDto,
): Promise<DriverDto> {
  const [created] = await createDriversBatch(client, { drivers: [driver] });
  if (!created) throw new Error('Driver creation returned an empty response.');
  return created;
}
