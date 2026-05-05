import { defineStore } from 'pinia';
import type {
  CarInsurancePolicyDto,
  CreateCarInsurancePolicyDto,
  PayCarInsuranceInstallmentDto,
  ReplaceCarInsuranceInstallmentsDto,
  UpdateCarInsurancePolicyDto,
} from '#shared/dto/car-insurance.dto';
import type { ExpenseDto } from '#shared/dto/expense.dto';
import {
  createCarInsurancePolicy as createCarInsurancePolicyRequest,
  deleteCarInsurancePolicy as deleteCarInsurancePolicyRequest,
  getCarInsurancePolicies,
  getCarInsurancePolicyById,
  payCarInsuranceInstallment as payCarInsuranceInstallmentRequest,
  replaceCarInsuranceInstallments as replaceCarInsuranceInstallmentsRequest,
  updateCarInsurancePolicy as updateCarInsurancePolicyRequest,
} from '../api/car-insurance';

export const useCarInsuranceStore = defineStore('carInsurance', () => {
  const { authenticatedApi } = useApi();

  /** Car id for the loaded `policies` list (null before first fetch). */
  const carId = ref<string | null>(null);
  const policies = ref<CarInsurancePolicyDto[] | null>(null);
  const loading = ref(false);
  const listError = ref<unknown | null>(null);

  const creating = ref(false);
  const updating = ref(false);
  const deleting = ref(false);
  const replacingInstallments = ref(false);
  const payingInstallment = ref(false);

  const items = computed(() => policies.value ?? []);
  const listResolved = computed(() => policies.value !== null);

  function upsertPolicy(policy: CarInsurancePolicyDto) {
    if (!policies.value) {
      policies.value = [policy];
      return;
    }
    const idx = policies.value.findIndex((p) => p.id === policy.id);
    if (idx === -1) {
      policies.value = [...policies.value, policy];
    } else {
      policies.value = policies.value.map((p) => (p.id === policy.id ? policy : p));
    }
  }

  function removePolicy(policyId: string) {
    if (!policies.value) return;
    policies.value = policies.value.filter((p) => p.id !== policyId);
  }

  function reset() {
    carId.value = null;
    policies.value = null;
    listError.value = null;
    loading.value = false;
    creating.value = false;
    updating.value = false;
    deleting.value = false;
    replacingInstallments.value = false;
    payingInstallment.value = false;
  }

  async function fetchPoliciesForCar(id: string): Promise<CarInsurancePolicyDto[]> {
    carId.value = id;
    loading.value = true;
    listError.value = null;
    try {
      const list = await getCarInsurancePolicies(authenticatedApi, id);
      policies.value = list;
      return list;
    } catch (e) {
      listError.value = e;
      policies.value = null;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPolicyById(
    id: string,
    policyId: string,
  ): Promise<CarInsurancePolicyDto> {
    const policy = await getCarInsurancePolicyById(authenticatedApi, id, policyId);
    if (carId.value === id) {
      upsertPolicy(policy);
    }
    return policy;
  }

  async function createPolicy(
    id: string,
    payload: CreateCarInsurancePolicyDto,
  ): Promise<CarInsurancePolicyDto> {
    creating.value = true;
    try {
      const created = await createCarInsurancePolicyRequest(authenticatedApi, id, payload);
      if (carId.value === id) {
        upsertPolicy(created);
      }
      return created;
    } finally {
      creating.value = false;
    }
  }

  async function updatePolicy(
    id: string,
    policyId: string,
    payload: UpdateCarInsurancePolicyDto,
  ): Promise<CarInsurancePolicyDto> {
    updating.value = true;
    try {
      const updated = await updateCarInsurancePolicyRequest(
        authenticatedApi,
        id,
        policyId,
        payload,
      );
      if (carId.value === id) {
        upsertPolicy(updated);
      }
      return updated;
    } finally {
      updating.value = false;
    }
  }

  async function deletePolicy(id: string, policyId: string): Promise<void> {
    deleting.value = true;
    try {
      await deleteCarInsurancePolicyRequest(authenticatedApi, id, policyId);
      if (carId.value === id) {
        removePolicy(policyId);
      }
    } finally {
      deleting.value = false;
    }
  }

  async function replaceInstallments(
    id: string,
    policyId: string,
    payload: ReplaceCarInsuranceInstallmentsDto,
  ): Promise<CarInsurancePolicyDto> {
    replacingInstallments.value = true;
    try {
      const updated = await replaceCarInsuranceInstallmentsRequest(
        authenticatedApi,
        id,
        policyId,
        payload,
      );
      if (carId.value === id) {
        upsertPolicy(updated);
      }
      return updated;
    } finally {
      replacingInstallments.value = false;
    }
  }

  async function payInstallment(
    id: string,
    policyId: string,
    installmentId: string,
    payload: PayCarInsuranceInstallmentDto = {},
  ): Promise<ExpenseDto> {
    payingInstallment.value = true;
    try {
      const expense = await payCarInsuranceInstallmentRequest(
        authenticatedApi,
        id,
        policyId,
        installmentId,
        payload,
      );
      if (carId.value === id) {
        const refreshed = await getCarInsurancePolicyById(
          authenticatedApi,
          id,
          policyId,
        );
        upsertPolicy(refreshed);
      }
      return expense;
    } finally {
      payingInstallment.value = false;
    }
  }

  return {
    carId,
    policies,
    loading,
    listError,
    creating,
    updating,
    deleting,
    replacingInstallments,
    payingInstallment,
    items,
    listResolved,
    reset,
    fetchPoliciesForCar,
    fetchPolicyById,
    createPolicy,
    updatePolicy,
    deletePolicy,
    replaceInstallments,
    payInstallment,
  };
});
