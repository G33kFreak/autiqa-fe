import type { InsuranceDueAlertItemDto } from './insurance-due-alert-item.dto';

export interface InsuranceDuesExpiringSoonDto {
  count: number;
  items: InsuranceDueAlertItemDto[];
}
