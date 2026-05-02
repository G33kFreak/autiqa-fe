import { defineStore } from 'pinia';
import type { DriverDto } from '#shared/dto/driver.dto';
import type { DriverDetailsDto } from '#shared/dto/driver-details.dto';
import type { CreateDriverDto } from '#shared/dto/create-driver.dto';
import type { FileDto } from '#shared/dto/file.dto';
import type { PaginatedDriversResponseDto } from '#shared/dto/paginated-drivers-response.dto';
import type { DriversPaginationQueryDto } from '#shared/dto/drivers-pagination-query.dto';
import {
  createDriversBatch as createDriversBatchRequest,
  deleteDriverDocument as deleteDriverDocumentRequest,
  getDriverById,
  getDrivers,
  uploadDriverDocuments as uploadDriverDocumentsRequest,
  updateDriver as updateDriverRequest,
} from '../api/drivers';
import { toDriversBatchCreateError } from '../utils/drivers-batch-error';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export const useDriversStore = defineStore('drivers', () => {
  const { authenticatedApi } = useApi();
  const carsStore = useCarsStore();

  const page = ref(DEFAULT_PAGE);
  const limit = ref(DEFAULT_LIMIT);
  const search = ref('');

  const paginated = ref<PaginatedDriversResponseDto | null>(null);
  const loading = ref(false);
  const listError = ref<unknown | null>(null);

  const items = computed(() => paginated.value?.data ?? []);
  const meta = computed(() => paginated.value?.meta ?? null);
  /** True after the list has loaded successfully at least once. */
  const listResolved = computed(() => paginated.value !== null);

  const creating = ref(false);
  const updating = ref(false);
  const uploadingDocuments = ref(false);
  const deletingDocumentId = ref<string | null>(null);

  function reset() {
    paginated.value = null;
    listError.value = null;
    loading.value = false;
    creating.value = false;
    updating.value = false;
    uploadingDocuments.value = false;
    deletingDocumentId.value = null;
  }

  async function fetchDrivers(
    overrides?: Partial<DriversPaginationQueryDto>,
  ): Promise<PaginatedDriversResponseDto> {
    if (overrides?.page !== undefined) page.value = overrides.page;
    if (overrides?.limit !== undefined) limit.value = overrides.limit;
    if (overrides?.search !== undefined) search.value = overrides.search;
    loading.value = true;
    listError.value = null;
    try {
      const query: DriversPaginationQueryDto = {
        page: page.value,
        limit: limit.value,
        search: search.value.trim() || undefined,
      };
      const result = await getDrivers(authenticatedApi, query);
      paginated.value = result;
      return result;
    } catch (e) {
      listError.value = e;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchDriverById(id: string): Promise<DriverDetailsDto | null> {
    const fetched = await getDriverById(authenticatedApi, id);
    if (paginated.value) {
      const exists = paginated.value.data.some((item) => item.id === fetched.id);
      if (exists) {
        paginated.value = {
          ...paginated.value,
          data: paginated.value.data.map((item) =>
            item.id === fetched.id ? fetched : item,
          ),
        };
      }
    }
    return fetched;
  }

  async function searchDrivers(
    searchTerm: string,
    searchLimit = 10,
  ): Promise<DriverDto[]> {
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

  async function createDrivers(
    payloads: CreateDriverDto[],
  ): Promise<DriverDto[]> {
    if (payloads.length === 0) return [];
    creating.value = true;
    try {
      const created = await createDriversBatchRequest(authenticatedApi, {
        drivers: payloads,
      });
      if (paginated.value) {
        paginated.value = {
          ...paginated.value,
          data: [...created, ...paginated.value.data],
        };
      } else {
        await fetchDrivers();
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

  async function update(
    id: string,
    payload: CreateDriverDto,
  ): Promise<DriverDto> {
    updating.value = true;
    try {
      const updated = await updateDriverRequest(authenticatedApi, id, payload);
      if (paginated.value) {
        paginated.value = {
          ...paginated.value,
          data: paginated.value.data.map((item) =>
            item.id === updated.id ? updated : item,
          ),
        };
      }
      return updated;
    } finally {
      carsStore.reset();
      updating.value = false;
    }
  }

  async function uploadDocuments(
    driverId: string,
    files: readonly File[],
  ): Promise<FileDto[]> {
    if (files.length === 0) return [];
    uploadingDocuments.value = true;
    try {
      return await uploadDriverDocumentsRequest(authenticatedApi, driverId, files);
    } finally {
      uploadingDocuments.value = false;
    }
  }

  async function deleteDocument(driverId: string, docId: string): Promise<void> {
    deletingDocumentId.value = docId;
    try {
      await deleteDriverDocumentRequest(authenticatedApi, driverId, docId);
    } finally {
      deletingDocumentId.value = null;
    }
  }

  return {
    items,
    meta,
    loading,
    listError,
    creating,
    updating,
    uploadingDocuments,
    deletingDocumentId,
    page,
    limit,
    search,
    listResolved,
    reset,
    fetchDrivers,
    fetchDriverById,
    searchDrivers,
    getDriverSuggestions,
    createDrivers,
    update,
    uploadDocuments,
    deleteDocument,
  };
});
