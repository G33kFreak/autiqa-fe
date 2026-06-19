import { defineStore } from 'pinia';
import type { CarPhotoDto } from '#shared/dto/car-photo.dto';
import type {
  CarDocumentDto,
  CarDocumentCategory,
} from '#shared/dto/car-document.dto';
import {
  deleteCarPhoto,
  setCarCoverPhoto,
  uploadCarPhoto,
} from '../api/car-photos';
import { deleteCarDocument, uploadCarDocument } from '../api/car-documents';

/** Photos and documents for a vehicle. Thin, no caching. */
export const useCarAssetsStore = defineStore('carAssets', () => {
  const { authenticatedApi } = useApi();

  // ── Photos ──
  // TODO(photos-endpoint): the car photos read endpoint isn't deployed yet.
  // Until it ships, treat the gallery as available-but-empty so the detail page
  // loads and shows its empty state instead of failing the whole `Promise.all`.
  // Restore `getCarPhotos(authenticatedApi, carId)` (and its import) once ready.
  function listPhotos(_carId: string): Promise<CarPhotoDto[]> {
    return Promise.resolve([]);
  }

  async function uploadPhoto(carId: string, file: File): Promise<CarPhotoDto[]> {
    await uploadCarPhoto(authenticatedApi, carId, file);
    return listPhotos(carId);
  }

  async function setCoverPhoto(
    carId: string,
    photoId: string,
  ): Promise<CarPhotoDto[]> {
    await setCarCoverPhoto(authenticatedApi, carId, photoId);
    return listPhotos(carId);
  }

  async function removePhoto(
    carId: string,
    photoId: string,
  ): Promise<CarPhotoDto[]> {
    await deleteCarPhoto(authenticatedApi, carId, photoId);
    return listPhotos(carId);
  }

  // ── Documents ──
  // TODO(documents-endpoint): the car documents read endpoint isn't deployed
  // yet. Until it ships, treat documents as available-but-empty so the detail
  // page loads and shows its empty state instead of failing the `Promise.all`.
  // Restore `getCarDocuments(authenticatedApi, carId)` (and its import) once ready.
  function listDocuments(_carId: string): Promise<CarDocumentDto[]> {
    return Promise.resolve([]);
  }

  async function uploadDocument(
    carId: string,
    file: File,
    meta: { category: CarDocumentCategory; expiresAt?: string | null },
  ): Promise<CarDocumentDto[]> {
    await uploadCarDocument(authenticatedApi, carId, file, meta);
    return listDocuments(carId);
  }

  async function removeDocument(
    carId: string,
    documentId: string,
  ): Promise<CarDocumentDto[]> {
    await deleteCarDocument(authenticatedApi, carId, documentId);
    return listDocuments(carId);
  }

  return {
    listPhotos,
    uploadPhoto,
    setCoverPhoto,
    removePhoto,
    listDocuments,
    uploadDocument,
    removeDocument,
  };
});
