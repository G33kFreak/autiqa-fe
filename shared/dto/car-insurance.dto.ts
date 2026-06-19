/**
 * A vehicle insurance policy — mirrors the backend `CarInsuranceDto`.
 *
 * Unlike v1, paying an installment does not silently spawn a ledger expense;
 * the policy owns its own cost and payment schedule. `coverageEnd` of the most
 * recent policy is what feeds the vehicle's insurance compliance deadline.
 */
export interface InsuranceInstallmentDto {
  id: string;
  dueDate: string;
  amount: string;
  /** ISO timestamp when settled, or null while outstanding. */
  paidAt: string | null;
}

export interface CarInsuranceDto {
  id: string;
  carId: string;
  provider: string;
  policyNumber: string | null;
  coverageStart: string;
  coverageEnd: string;
  /** Total premium for the coverage window. */
  premium: string;
  currency: string;
  /** Optional payment plan; a single-row plan means "paid in full". */
  installments: InsuranceInstallmentDto[];
  createdAt: string;
}

/** Body for creating or replacing a policy. Installments are derived server-side. */
export interface CreateCarInsuranceDto {
  provider: string;
  policyNumber?: string | null;
  coverageStart: string;
  coverageEnd: string;
  premium: string;
  currency: string;
  /** Number of equal installments to schedule across the coverage window. */
  installmentCount: number;
}
