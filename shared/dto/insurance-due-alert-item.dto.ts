import type { CarInsuranceInstallmentDto, CarInsurancePolicyDto } from './car-insurance.dto';
import type { CarDto } from './car.dto';

export interface InsuranceDueAlertItemDto {
  car: CarDto;
  insurance: CarInsurancePolicyDto;
  installment: CarInsuranceInstallmentDto;
}
