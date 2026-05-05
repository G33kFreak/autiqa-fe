/**
 * Car insurance policy API — mirrors backend DTOs.
 * Dates are ISO 8601 strings in JSON responses.
 */

/** One line in the schedule (order in array = sequence 1..n). */
export interface CreateCarInsuranceInstallmentItemDto {
  dueDate: string;
  amount: string;
}

export interface CreateCarInsurancePolicyDto {
  paymentType?: CarInsurancePaymentType;
  coverageStart: string;
  coverageEnd: string;
  paymentAmount: string;
  currency?: string;
  insurerName?: string;
  policyNumber?: string;
  notes?: string;
  installments?: CreateCarInsuranceInstallmentItemDto[];
}

/** PATCH — at least one field required on the server. */
export interface UpdateCarInsurancePolicyDto {
  paymentType?: CarInsurancePaymentType;
  coverageStart?: string;
  coverageEnd?: string;
  paymentAmount?: string;
  currency?: string;
  insurerName?: string;
  policyNumber?: string;
  notes?: string;
  installments?: CreateCarInsuranceInstallmentItemDto[];
}

export interface ReplaceCarInsuranceInstallmentsDto {
  installments: CreateCarInsuranceInstallmentItemDto[];
}

export interface PayCarInsuranceInstallmentDto {
  occurredAt?: string;
  title?: string;
  notes?: string;
}

export interface CarInsuranceInstallmentDto {
  id: string;
  sequence: number;
  dueDate: string;
  amount: string;
  expenseId: string | null;
}

export type CarInsurancePaymentType = 'ONE_TIME' | 'INSTALLMENTS';

export interface CarInsurancePolicyDto {
  id: string;
  organizationId: string;
  carId: string;
  coverageStart: string;
  coverageEnd: string;
  paymentAmount: string;
  paymentType: CarInsurancePaymentType;
  currency: string;
  insurerName: string | null;
  policyNumber: string | null;
  notes: string | null;
  installments: CarInsuranceInstallmentDto[];
  createdAt: string;
  updatedAt: string;
}
