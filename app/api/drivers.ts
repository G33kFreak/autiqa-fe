import type { ApiClient } from './types';
import type { DriverDto } from '~~/shared/dto/driver.dto';
import type { CreateDriversBatchDto } from '~~/shared/dto/create-drivers-batch.dto';
import type { DriversPaginationQueryDto } from '~~/shared/dto/drivers-pagination-query.dto';
import type { PaginatedDriversResponseDto } from '~~/shared/dto/paginated-drivers-response.dto';
import type { CreateDriverDto } from '~~/shared/dto/create-driver.dto';
import type { FileDto } from '~~/shared/dto/file.dto';
import type { DriverDetailsDto } from '~~/shared/dto/driver-details.dto';

export function getDrivers(client: ApiClient, query: DriversPaginationQueryDto) {
  return client<PaginatedDriversResponseDto>('/drivers', {
    method: 'GET',
    query,
  });
}

export function getDriverById(client: ApiClient, id: string) {
  return client<DriverDetailsDto>(`/drivers/${id}`, {
    method: 'GET',
  });
}

export function createDriversBatch(client: ApiClient, body: CreateDriversBatchDto) {
  return client<DriverDto[]>('/drivers', {
    method: 'POST',
    body,
  });
}

export function updateDriver(client: ApiClient, id: string, body: CreateDriverDto) {
  return client<DriverDto>(`/drivers/${id}`, {
    method: 'PATCH',
    body,
  });
}

export function uploadDriverDocuments(
  client: ApiClient,
  driverId: string,
  files: readonly File[],
) {
  const body = new FormData();
  files.forEach((file) => {
    body.append('files', file);
  });
  return client<FileDto[]>(`/drivers/${driverId}/docs`, {
    method: 'POST',
    body,
  });
}

export function deleteDriverDocument(
  client: ApiClient,
  driverId: string,
  docId: string,
) {
  return client<unknown>(`/drivers/${driverId}/docs/${docId}`, {
    method: 'DELETE',
  });
}
