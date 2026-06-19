/**
 * A photo attached to a vehicle — mirrors the backend `CarPhotoDto`.
 *
 * Photos document the vehicle's real condition: bodywork before a rental
 * handover, damage on return, the odometer. One photo per car is the cover,
 * surfaced wherever the vehicle is represented.
 */
export interface CarPhotoDto {
  id: string;
  carId: string;
  /** Full-size image URL. */
  url: string;
  /** Optional smaller URL for grids; falls back to `url` when absent. */
  thumbnailUrl: string | null;
  /** Human label — original filename or an operator caption. */
  name: string;
  /** The cover photo represents the car across the app. At most one per car. */
  isCover: boolean;
  sizeBytes: number | null;
  createdAt: string;
}
