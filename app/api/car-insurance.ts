import type { ApiClient } from './types';
import type {
  CreateInsurancePolicyDto,
  InsurancePolicyDto,
} from '#shared/dto/car-insurance-policy.dto';

const base = (carId: string) => `/cars/${carId}/insurance-policies`;

/** List a car's insurance policies. */
export function getCarInsurancePolicies(client: ApiClient, carId: string) {
  return client<InsurancePolicyDto[]>(base(carId), { method: 'GET' });
}

/** Create an insurance policy (schedule derived server-side). */
export function createCarInsurancePolicy(
  client: ApiClient,
  carId: string,
  body: CreateInsurancePolicyDto,
) {
  return client<InsurancePolicyDto>(base(carId), { method: 'POST', body });
}

/** Settle or reopen a single installment. */
export function setInsuranceInstallmentPaid(
  client: ApiClient,
  carId: string,
  policyId: string,
  installmentId: string,
  paid: boolean,
) {
  return client<InsurancePolicyDto>(
    `${base(carId)}/${policyId}/installments/${installmentId}`,
    { method: 'PATCH', body: { paid } },
  );
}

/** Delete an insurance policy. */
export function deleteCarInsurancePolicy(
  client: ApiClient,
  carId: string,
  policyId: string,
) {
  return client<unknown>(`${base(carId)}/${policyId}`, { method: 'DELETE' });
}
