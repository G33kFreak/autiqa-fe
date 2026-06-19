import type { ApiClient } from './types';
import type { CarPhotoDto } from '#shared/dto/car-photo.dto';

/** List a car's photos. */
export function getCarPhotos(client: ApiClient, carId: string) {
  return client<CarPhotoDto[]>(`/cars/${carId}/photos`, { method: 'GET' });
}

/** Upload a photo (multipart). */
export function uploadCarPhoto(client: ApiClient, carId: string, file: File) {
  const body = new FormData();
  body.append('file', file);
  return client<CarPhotoDto>(`/cars/${carId}/photos`, { method: 'POST', body });
}

/** Mark a photo as the car's cover. */
export function setCarCoverPhoto(
  client: ApiClient,
  carId: string,
  photoId: string,
) {
  return client<CarPhotoDto[]>(`/cars/${carId}/photos/${photoId}/cover`, {
    method: 'PUT',
  });
}

/** Delete a photo. */
export function deleteCarPhoto(
  client: ApiClient,
  carId: string,
  photoId: string,
) {
  return client<unknown>(`/cars/${carId}/photos/${photoId}`, { method: 'DELETE' });
}
