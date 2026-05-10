import type { CarDto } from './car.dto';

export interface InspectionExpiringSoonDto {
  count: number;
  items: CarDto[];
}
