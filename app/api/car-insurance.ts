import type { ApiClient } from './types';
import type {
  CarInsuranceDto,
  CreateCarInsuranceDto,
} from '#shared/dto/car-insurance.dto';

/** List a car's insurance policies, newest coverage first. */
export function getCarInsurance(client: ApiClient, carId: string) {
  return client<CarInsuranceDto[]>(`/cars/${carId}/insurance`, { method: 'GET' });
}

/** Create an insurance policy (the schedule is derived server-side). */
export function createCarInsurance(
  client: ApiClient,
  carId: string,
  body: CreateCarInsuranceDto,
) {
  return client<CarInsuranceDto>(`/cars/${carId}/insurance`, {
    method: 'POST',
    body,
  });
}

/** Mark a single installment paid or unpaid. */
export function setInsuranceInstallmentPaid(
  client: ApiClient,
  carId: string,
  policyId: string,
  installmentId: string,
  paid: boolean,
) {
  return client<CarInsuranceDto>(
    `/cars/${carId}/insurance/${policyId}/installments/${installmentId}`,
    { method: 'PATCH', body: { paid } },
  );
}

/** Delete an insurance policy. */
export function deleteCarInsurance(
  client: ApiClient,
  carId: string,
  policyId: string,
) {
  return client<unknown>(`/cars/${carId}/insurance/${policyId}`, {
    method: 'DELETE',
  });
}
