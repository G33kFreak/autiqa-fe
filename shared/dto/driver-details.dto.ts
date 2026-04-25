import type { DriverDto } from './driver.dto';
import type { FileDto } from './file.dto';

/**
 * Driver details payload returned by `GET /drivers/:id`.
 */
export interface DriverDetailsDto extends DriverDto {
  documents: readonly FileDto[];
}
