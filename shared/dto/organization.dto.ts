/**
 * Organization from the API — mirrors backend `OrganizationDto`.
 * Dates are ISO 8601 strings in JSON responses.
 */
export type PaidPlan = 'FREE' | 'STANDARD';

export interface OrganizationDto {
  id: string;
  name: string;
  plan: PaidPlan;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating the organization owned by the current user. */
export interface CreateOrganizationDto {
  name: string;
}
