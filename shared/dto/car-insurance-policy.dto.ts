/**
 * Real backend insurance contract — `GET /cars/{carId}/insurance-policies`.
 *
 * The client maps this onto the `CarInsuranceDto` view model (see
 * car-insurance.dto.ts) so the UI stays decoupled from the wire shape.
 * Notably: a policy's cost is `paymentAmount`, the insurer is `insurerName`,
 * and an installment is settled when it carries a linked `expenseId` (there is
 * no paid-at timestamp — "paid" is the existence of the expense link).
 */
export type InsurancePaymentType = 'ONE_TIME' | 'INSTALLMENTS';

export interface InsurancePolicyInstallmentDto {
  id: string;
  sequence: number;
  dueDate: string;
  amount: string;
  /** Linked expense id once settled; null while outstanding. */
  expenseId: string | null;
}

export interface InsurancePolicyDto {
  id: string;
  organizationId: string;
  carId: string;
  coverageStart: string;
  coverageEnd: string;
  paymentAmount: string;
  paymentType: InsurancePaymentType;
  currency: string;
  insurerName: string | null;
  policyNumber: string | null;
  notes: string | null;
  installments: InsurancePolicyInstallmentDto[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Body for creating a policy. NOTE: assumed shape — only the read contract was
 * provided. Mirrors the read fields; `installmentCount` asks the backend to
 * derive the schedule across the coverage window.
 */
export interface CreateInsurancePolicyDto {
  insurerName?: string | null;
  policyNumber?: string | null;
  notes?: string | null;
  coverageStart: string;
  coverageEnd: string;
  paymentAmount: string;
  currency: string;
  paymentType: InsurancePaymentType;
  installmentCount: number;
}
