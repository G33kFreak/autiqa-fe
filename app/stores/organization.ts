import { defineStore } from 'pinia';
import { FetchError } from 'ofetch';
import { StatusCodes } from 'http-status-codes';
import type { OrganizationDto } from '#shared/dto/organization.dto';
import type { CreateOrganizationDto } from '#shared/dto/create-organization.dto';
import {
  createOrganization as createOrganizationRequest,
  getMyOrganization,
} from '../api/organizations';

export const useOrganizationStore = defineStore('organization', () => {
  const { authenticatedApi } = useApi();

  async function fetchCurrent(): Promise<OrganizationDto | null> {
    try {
      return await getMyOrganization(authenticatedApi);
    } catch (e: unknown) {
      if (
        e instanceof FetchError &&
        (e.status ?? e.statusCode) === StatusCodes.NOT_FOUND
      ) {
        return null;
      }
      throw e;
    }
  }

  const vm = useLazyViewModel<OrganizationDto>({
    load: fetchCurrent,
  });

  const organization = computed(() => vm.data.value ?? null);
  const creating = ref(false);

  const hasOrganization = computed(() => organization.value !== null);

  async function getViewModel(): Promise<OrganizationDto | null> {
    return vm.getViewModel();
  }

  function reset() {
    vm.reset();
    creating.value = false;
  }

  async function createOrganization(
    payload: CreateOrganizationDto,
  ): Promise<OrganizationDto> {
    creating.value = true;
    try {
      const org = await createOrganizationRequest(authenticatedApi, payload);
      vm.setLoaded(org);
      return org;
    } finally {
      creating.value = false;
    }
  }

  return {
    organization,
    loading: vm.loading,
    creating,
    hasOrganization,
    getViewModel,
    reset,
    createOrganization,
  };
});
