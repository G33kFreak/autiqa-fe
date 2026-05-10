import type { CarInsurancePolicyDto } from './car-insurance.dto';
import type { CarDto } from './car.dto';

export interface InsuranceExpiringAlertItemDto {
  car: CarDto;
  insurance: CarInsurancePolicyDto;
}
