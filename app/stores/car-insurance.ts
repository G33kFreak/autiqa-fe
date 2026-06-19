import { defineStore } from 'pinia';
import type {
  CarInsuranceDto,
  CreateCarInsuranceDto,
} from '#shared/dto/car-insurance.dto';
import type {
  CreateInsurancePolicyDto,
  InsurancePolicyDto,
} from '#shared/dto/car-insurance-policy.dto';
import {
  createCarInsurancePolicy,
  deleteCarInsurancePolicy,
  getCarInsurancePolicies,
  setInsuranceInstallmentPaid,
} from '../api/car-insurance';

/**
 * Per-car insurance. The backend exposes rich `InsurancePolicyDto`s on
 * `/cars/:id/insurance-policies`; this store folds them into the UI-shaped
 * `CarInsuranceDto` view model (insurer → provider, paymentAmount → premium,
 * an installment's linked `expenseId` → a `paid` flag).
 */

function toViewModel(p: InsurancePolicyDto): CarInsuranceDto {
  return {
    id: p.id,
    carId: p.carId,
    provider: p.insurerName ?? '',
    policyNumber: p.policyNumber,
    coverageStart: p.coverageStart,
    coverageEnd: p.coverageEnd,
    premium: p.paymentAmount,
    currency: p.currency,
    installments: [...p.installments]
      .sort((a, b) => a.sequence - b.sequence)
      .map((i) => ({
        id: i.id,
        dueDate: i.dueDate,
        amount: i.amount,
        paid: i.expenseId != null,
      })),
    createdAt: p.createdAt,
  };
}

function toCreateBody(body: CreateCarInsuranceDto): CreateInsurancePolicyDto {
  return {
    insurerName: body.provider,
    policyNumber: body.policyNumber ?? null,
    coverageStart: body.coverageStart,
    coverageEnd: body.coverageEnd,
    paymentAmount: body.premium,
    currency: body.currency,
    paymentType: body.installmentCount > 1 ? 'INSTALLMENTS' : 'ONE_TIME',
    installmentCount: body.installmentCount,
  };
}

export const useCarInsuranceStore = defineStore('carInsurance', () => {
  const { authenticatedApi: api } = useApi();

  async function list(carId: string): Promise<CarInsuranceDto[]> {
    const policies = await getCarInsurancePolicies(api, carId);
    return policies.map(toViewModel);
  }

  async function create(
    carId: string,
    body: CreateCarInsuranceDto,
  ): Promise<CarInsuranceDto[]> {
    await createCarInsurancePolicy(api, carId, toCreateBody(body));
    return list(carId);
  }

  async function setInstallmentPaid(
    carId: string,
    policyId: string,
    installmentId: string,
    paid: boolean,
  ): Promise<CarInsuranceDto[]> {
    await setInsuranceInstallmentPaid(api, carId, policyId, installmentId, paid);
    return list(carId);
  }

  async function remove(
    carId: string,
    policyId: string,
  ): Promise<CarInsuranceDto[]> {
    await deleteCarInsurancePolicy(api, carId, policyId);
    return list(carId);
  }

  return { list, create, setInstallmentPaid, remove };
});
