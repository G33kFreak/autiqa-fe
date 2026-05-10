import type { InsuranceExpiringAlertItemDto } from './insurance-expiring-alert-item.dto';

export interface InsuranceExpiringSoonDto {
  count: number;
  items: InsuranceExpiringAlertItemDto[];
}
