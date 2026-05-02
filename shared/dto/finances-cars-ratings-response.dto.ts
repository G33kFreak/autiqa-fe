import type { FinancesCarRatingEntryDto } from './finances-car-rating-entry.dto';

/**
 * Cars ratings payload — mirrors backend `FinancesCarsRatingsResponseDto`.
 */
export interface FinancesCarsRatingsResponseDto {
  expenses: FinancesCarRatingEntryDto[];
  earnings: FinancesCarRatingEntryDto[];
}
