import type { ApiClient } from './types';
import type { OrganizationDto } from '~~/shared/dto/organization.dto';
import type { CreateOrganizationDto } from '~~/shared/dto/create-organization.dto';

export function getMyOrganization(client: ApiClient) {
  return client<OrganizationDto>('/organizations/my', {
    method: 'GET',
  });
}

export function createOrganization(
  client: ApiClient,
  body: CreateOrganizationDto,
) {
  return client<OrganizationDto>('/organizations', {
    method: 'POST',
    body,
  });
}
