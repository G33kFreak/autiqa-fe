/**
 * Insurance **view model** for the detail screen. The backend wire shape lives
 * in car-insurance-policy.dto.ts (`InsurancePolicyDto`); the store maps onto
 * this so components read stable, UI-shaped fields. `coverageEnd` of the most
 * recent policy feeds the vehicle's insurance compliance deadline.
 */
export interface InsuranceInstallmentDto {
  id: string;
  dueDate: string;
  amount: string;
  /** Settled (backend: has a linked expense) vs. outstanding. */
  paid: boolean;
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
