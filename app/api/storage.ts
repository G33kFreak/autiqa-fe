import type { ApiClient } from './types';

export interface StorageSignedUrlDto {
  fileId: string;
  url: string;
}

export function getStorageSignedUrl(client: ApiClient, fileId: string) {
  return client<StorageSignedUrlDto>(`/storage/${fileId}/signed-url`, {
    method: 'GET',
  });
}
