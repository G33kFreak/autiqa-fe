import type {
  CreateOrganizationDto,
  OrganizationDto,
} from '#shared/dto/organization.dto';
import type { ApiClient } from './types';

/** Create the organization owned by the current user. 409 if one already exists. */
export function createOrganization(
  client: ApiClient,
  body: CreateOrganizationDto,
) {
  return client<OrganizationDto>('/organizations', {
    method: 'POST',
    body,
  });
}

/** Fetch the organization owned by the current user. 404 if none yet. */
export function getMyOrganization(client: ApiClient) {
  return client<OrganizationDto>('/organizations/my', {
    method: 'GET',
  });
}
