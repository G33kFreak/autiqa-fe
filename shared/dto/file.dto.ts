/**
 * Generic file metadata returned by backend upload endpoints.
 */
export interface FileDto {
  id: string;
  mimetype: string;
  originalName: string;
  size: number;
}
