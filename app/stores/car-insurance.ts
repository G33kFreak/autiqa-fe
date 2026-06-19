import { defineStore } from 'pinia';
import type {
  CarInsuranceDto,
  CreateCarInsuranceDto,
} from '#shared/dto/car-insurance.dto';
import {
  createCarInsurance,
  deleteCarInsurance,
  getCarInsurance,
  setInsuranceInstallmentPaid,
} from '../api/car-insurance';
import { demoInsurance, withDemoFallback } from '~/utils/car-demo';

/** Per-car insurance policies and their installment schedules. Thin, no caching. */
export const useCarInsuranceStore = defineStore('carInsurance', () => {
  const { authenticatedApi } = useApi();

  function list(carId: string): Promise<CarInsuranceDto[]> {
    return withDemoFallback(
      () => getCarInsurance(authenticatedApi, carId),
      () => demoInsurance.list(carId),
    );
  }

  async function create(
    carId: string,
    body: CreateCarInsuranceDto,
  ): Promise<CarInsuranceDto[]> {
    await withDemoFallback(
      () => createCarInsurance(authenticatedApi, carId, body),
      () => demoInsurance.add(carId, body),
    );
    return list(carId);
  }

  async function setInstallmentPaid(
    carId: string,
    policyId: string,
    installmentId: string,
    paid: boolean,
  ): Promise<CarInsuranceDto[]> {
    await withDemoFallback(
      () =>
        setInsuranceInstallmentPaid(
          authenticatedApi,
          carId,
          policyId,
          installmentId,
          paid,
        ),
      () => demoInsurance.setInstallmentPaid(carId, policyId, installmentId, paid),
    );
    return list(carId);
  }

  async function remove(
    carId: string,
    policyId: string,
  ): Promise<CarInsuranceDto[]> {
    await withDemoFallback(
      () => deleteCarInsurance(authenticatedApi, carId, policyId),
      () => demoInsurance.remove(carId, policyId),
    );
    return list(carId);
  }

  return { list, create, setInstallmentPaid, remove };
});
