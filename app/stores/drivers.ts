import { defineStore } from 'pinia';
import type { DriverDto } from '#shared/dto/driver.dto';
import type { CreateDriverDto } from '#shared/dto/create-driver.dto';
import type { PaginatedDriversResponseDto } from '#shared/dto/paginated-drivers-response.dto';
import type { DriversPaginationQueryDto } from '#shared/dto/drivers-pagination-query.dto';
import {
  createDriversBatch as createDriversBatchRequest,
  getDrivers,
} from '../api/drivers';
import { toDriversBatchCreateError } from '../utils/drivers-batch-error';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export const useDriversStore = defineStore('drivers', () => {
  const { authenticatedApi } = useApi();
  const page = ref(DEFAULT_PAGE);
  const limit = ref(DEFAULT_LIMIT);
  const search = ref('');

  async function loadDrivers(): Promise<PaginatedDriversResponseDto> {
    const query: DriversPaginationQueryDto = {
      page: page.value,
      limit: limit.value,
      search: search.value.trim() || undefined,
    };
    return await getDrivers(authenticatedApi, query);
  }

  const vm = useLazyViewModel<PaginatedDriversResponseDto>({
    load: loadDrivers,
  });

  const items = computed(() => vm.data.value?.data ?? []);
  const meta = computed(() => vm.data.value?.meta ?? null);
  /** True after the list has been loaded at least once. */
  const listResolved = computed(() => vm.data.value !== undefined);

  const creating = ref(false);
  const updating = ref(false);

  async function getViewModel(): Promise<PaginatedDriversResponseDto | null> {
    return vm.getViewModel();
  }

  async function getViewModelById(_id: string): Promise<DriverDto | null> {
    throw new Error('drivers.getViewModelById is not implemented yet');
  }

  async function fetchDrivers(overrides?: Partial<DriversPaginationQueryDto>) {
    if (overrides?.page !== undefined) page.value = overrides.page;
    if (overrides?.limit !== undefined) limit.value = overrides.limit;
    if (overrides?.search !== undefined) search.value = overrides.search;
    vm.reset();
    return vm.getViewModel();
  }

  async function searchDrivers(searchTerm: string, searchLimit = 10): Promise<DriverDto[]> {
    const query = searchTerm.trim();
    if (!query.length) return [];
    const response = await getDrivers(authenticatedApi, {
      page: 1,
      limit: searchLimit,
      search: query,
    });
    return response.data;
  }

  async function getDriverSuggestions(limitValue = 12): Promise<DriverDto[]> {
    const response = await getDrivers(authenticatedApi, {
      page: 1,
      limit: limitValue,
    });
    return response.data;
  }

  async function createDrivers(payloads: CreateDriverDto[]): Promise<DriverDto[]> {
    if (payloads.length === 0) return [];
    creating.value = true;
    try {
      const created = await createDriversBatchRequest(authenticatedApi, {
        drivers: payloads,
      });
      if (vm.data.value) {
        vm.data.value = {
          ...vm.data.value,
          data: [...created, ...vm.data.value.data],
        };
      } else {
        await getViewModel();
      }
      return created;
    } catch (e) {
      const batchErr = toDriversBatchCreateError(e);
      if (batchErr) throw batchErr;
      throw e;
    } finally {
      creating.value = false;
    }
  }

  async function update(_id: string, _payload: CreateDriverDto): Promise<DriverDto> {
    updating.value = true;
    try {
      throw new Error('drivers.update is not implemented yet');
    } finally {
      updating.value = false;
    }
  }

  return {
    items,
    meta,
    loading: vm.loading,
    creating,
    updating,
    page,
    limit,
    search,
    listResolved,
    getViewModel,
    getViewModelById,
    searchDrivers,
    getDriverSuggestions,
    fetchDrivers,
    createDrivers,
    update,
  };
});
