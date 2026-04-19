/**
 * POST create-organization body — mirrors backend `CreateOrganizationDto`.
 * Name must be non-empty (`@MinLength(1)` on the API).
 */
export interface CreateOrganizationDto {
  name: string;
}
