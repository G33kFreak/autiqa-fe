import type { InspectionExpiringSoonDto } from './inspection-expiring-soon.dto';
import type { InsuranceDuesExpiringSoonDto } from './insurance-dues-expiring-soon.dto';
import type { InsuranceExpiringSoonDto } from './insurance-expiring-soon.dto';

export interface AlertsOverviewResponseDto {
  InsuranceDuesExpiringSoon: InsuranceDuesExpiringSoonDto;
  InsuranceExpiringSoon: InsuranceExpiringSoonDto;
  inspectionExpiringSoon: InspectionExpiringSoonDto;
}
