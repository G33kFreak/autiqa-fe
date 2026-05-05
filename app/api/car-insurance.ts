import type { ApiClient } from './types';
import type {
  CarInsurancePolicyDto,
  CreateCarInsurancePolicyDto,
  PayCarInsuranceInstallmentDto,
  ReplaceCarInsuranceInstallmentsDto,
  UpdateCarInsurancePolicyDto,
} from '~~/shared/dto/car-insurance.dto';
import type { ExpenseDto } from '~~/shared/dto/expense.dto';

function policiesBase(carId: string) {
  return `/cars/${carId}/insurance-policies`;
}

export function getCarInsurancePolicies(client: ApiClient, carId: string) {
  return client<CarInsurancePolicyDto[]>(policiesBase(carId), {
    method: 'GET',
  });
}

export function createCarInsurancePolicy(
  client: ApiClient,
  carId: string,
  body: CreateCarInsurancePolicyDto,
) {
  return client<CarInsurancePolicyDto>(policiesBase(carId), {
    method: 'POST',
    body,
  });
}

export function getCarInsurancePolicyById(
  client: ApiClient,
  carId: string,
  policyId: string,
) {
  return client<CarInsurancePolicyDto>(`${policiesBase(carId)}/${policyId}`, {
    method: 'GET',
  });
}

export function updateCarInsurancePolicy(
  client: ApiClient,
  carId: string,
  policyId: string,
  body: UpdateCarInsurancePolicyDto,
) {
  return client<CarInsurancePolicyDto>(`${policiesBase(carId)}/${policyId}`, {
    method: 'PATCH',
    body,
  });
}

export function deleteCarInsurancePolicy(
  client: ApiClient,
  carId: string,
  policyId: string,
) {
  return client<unknown>(`${policiesBase(carId)}/${policyId}`, {
    method: 'DELETE',
  });
}

export function replaceCarInsuranceInstallments(
  client: ApiClient,
  carId: string,
  policyId: string,
  body: ReplaceCarInsuranceInstallmentsDto,
) {
  return client<CarInsurancePolicyDto>(
    `${policiesBase(carId)}/${policyId}/installments`,
    {
      method: 'PUT',
      body,
    },
  );
}

export function payCarInsuranceInstallment(
  client: ApiClient,
  carId: string,
  policyId: string,
  installmentId: string,
  body: PayCarInsuranceInstallmentDto = {},
) {
  return client<ExpenseDto>(
    `${policiesBase(carId)}/${policyId}/installments/${installmentId}/pay`,
    {
      method: 'POST',
      body,
    },
  );
}
