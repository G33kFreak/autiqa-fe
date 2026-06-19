import { defineStore } from 'pinia';
import type { CarPhotoDto } from '#shared/dto/car-photo.dto';
import type {
  CarDocumentDto,
  CarDocumentCategory,
} from '#shared/dto/car-document.dto';
import {
  deleteCarPhoto,
  getCarPhotos,
  setCarCoverPhoto,
  uploadCarPhoto,
} from '../api/car-photos';
import {
  deleteCarDocument,
  getCarDocuments,
  uploadCarDocument,
} from '../api/car-documents';
import {
  demoDocuments,
  demoPhotos,
  fileToDataUrl,
  imageFileToDataUrl,
  withDemoFallback,
} from '~/utils/car-demo';

/** Photos and documents for a vehicle. Thin: real API first, demo fallback. */
export const useCarAssetsStore = defineStore('carAssets', () => {
  const { authenticatedApi } = useApi();

  // ── Photos ──
  function listPhotos(carId: string): Promise<CarPhotoDto[]> {
    return withDemoFallback(
      () => getCarPhotos(authenticatedApi, carId),
      () => demoPhotos.list(carId),
    );
  }

  async function uploadPhoto(carId: string, file: File): Promise<CarPhotoDto[]> {
    await withDemoFallback(
      () => uploadCarPhoto(authenticatedApi, carId, file),
      async () => {
        const url = await imageFileToDataUrl(file);
        return demoPhotos.add(carId, {
          url,
          name: file.name,
          sizeBytes: file.size,
        });
      },
    );
    return listPhotos(carId);
  }

  async function setCoverPhoto(
    carId: string,
    photoId: string,
  ): Promise<CarPhotoDto[]> {
    await withDemoFallback(
      () => setCarCoverPhoto(authenticatedApi, carId, photoId),
      () => demoPhotos.setCover(carId, photoId),
    );
    return listPhotos(carId);
  }

  async function removePhoto(
    carId: string,
    photoId: string,
  ): Promise<CarPhotoDto[]> {
    await withDemoFallback(
      () => deleteCarPhoto(authenticatedApi, carId, photoId),
      () => demoPhotos.remove(carId, photoId),
    );
    return listPhotos(carId);
  }

  // ── Documents ──
  function listDocuments(carId: string): Promise<CarDocumentDto[]> {
    return withDemoFallback(
      () => getCarDocuments(authenticatedApi, carId),
      () => demoDocuments.list(carId),
    );
  }

  async function uploadDocument(
    carId: string,
    file: File,
    meta: { category: CarDocumentCategory; expiresAt?: string | null },
  ): Promise<CarDocumentDto[]> {
    await withDemoFallback(
      () => uploadCarDocument(authenticatedApi, carId, file, meta),
      async () => {
        const url = await fileToDataUrl(file);
        return demoDocuments.add(carId, {
          name: file.name,
          category: meta.category,
          url,
          mimeType: file.type || null,
          sizeBytes: file.size,
          expiresAt: meta.expiresAt ?? null,
        });
      },
    );
    return listDocuments(carId);
  }

  async function removeDocument(
    carId: string,
    documentId: string,
  ): Promise<CarDocumentDto[]> {
    await withDemoFallback(
      () => deleteCarDocument(authenticatedApi, carId, documentId),
      () => demoDocuments.remove(carId, documentId),
    );
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
