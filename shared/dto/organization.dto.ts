/**
 * Subscription plan — mirrors backend `PaidPlan`.
 */
export enum PaidPlan {
  FREE = 'FREE',
  STANDARD = 'STANDARD',
}

/**
 * Organization from the API — mirrors backend `OrganizationDto`.
 * Dates are ISO 8601 strings in JSON responses.
 */
export interface OrganizationDto {
  id: string;
  name: string;
  plan: PaidPlan;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
