import { defineStore } from 'pinia';
import { FetchError } from 'ofetch';
import { StatusCodes } from 'http-status-codes';
import type { OrganizationDto } from '#shared/dto/organization.dto';
import {
  createOrganization as createOrganizationRequest,
  getMyOrganization,
} from '../api/organizations';

export const useOrganizationStore = defineStore('organization', () => {
  const { authenticatedApi } = useApi();

  const organization = ref<OrganizationDto | null>(null);
  /** True once we have a definitive answer (an org or a confirmed 404). */
  const isLoaded = ref(false);
  /** In-flight load; reused so parallel middleware runs share one request. */
  const loadPromise = ref<Promise<void> | null>(null);

  const hasOrganization = computed(() => organization.value !== null);

  /**
   * Fetch the current user's organization once and cache it. A 404 is a valid
   * answer ("no org yet") and marks the store loaded; any other error leaves it
   * unloaded so the next navigation retries instead of trapping the user.
   */
  async function ensureLoaded(): Promise<void> {
    if (isLoaded.value) return;
    if (loadPromise.value) return loadPromise.value;

    const load = async () => {
      try {
        organization.value = await getMyOrganization(authenticatedApi);
        isLoaded.value = true;
      } catch (error: unknown) {
        const status =
          error instanceof FetchError ? (error.status ?? error.statusCode) : 0;
        if (status === StatusCodes.NOT_FOUND) {
          organization.value = null;
          isLoaded.value = true;
          return;
        }
        throw error;
      } finally {
        loadPromise.value = null;
      }
    };

    const promise = load();
    loadPromise.value = promise;
    return promise;
  }

  async function createOrganization(name: string): Promise<OrganizationDto> {
    const created = await createOrganizationRequest(authenticatedApi, { name });
    organization.value = created;
    isLoaded.value = true;
    return created;
  }

  /** Clear cached state, e.g. on logout. */
  function reset() {
    organization.value = null;
    isLoaded.value = false;
    loadPromise.value = null;
  }

  return {
    organization,
    isLoaded,
    hasOrganization,
    ensureLoaded,
    createOrganization,
    reset,
  };
});
