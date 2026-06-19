import type { ApiClient } from './types';
import type {
  CarDocumentDto,
  CarDocumentCategory,
} from '#shared/dto/car-document.dto';

/** List a car's documents. */
export function getCarDocuments(client: ApiClient, carId: string) {
  return client<CarDocumentDto[]>(`/cars/${carId}/documents`, { method: 'GET' });
}

/** Upload a document (multipart) with its category and optional expiry. */
export function uploadCarDocument(
  client: ApiClient,
  carId: string,
  file: File,
  meta: { category: CarDocumentCategory; expiresAt?: string | null },
) {
  const body = new FormData();
  body.append('file', file);
  body.append('category', meta.category);
  if (meta.expiresAt) body.append('expiresAt', meta.expiresAt);
  return client<CarDocumentDto>(`/cars/${carId}/documents`, {
    method: 'POST',
    body,
  });
}

/** Delete a document. */
export function deleteCarDocument(
  client: ApiClient,
  carId: string,
  documentId: string,
) {
  return client<unknown>(`/cars/${carId}/documents/${documentId}`, {
    method: 'DELETE',
  });
}
