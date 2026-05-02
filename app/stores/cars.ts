import { defineStore } from 'pinia';
import type { CarDto } from '#shared/dto/car.dto';
import type { CreateCarDto } from '#shared/dto/create-car.dto';
import type { PaginatedCarsResponseDto } from '#shared/dto/paginated-cars-response.dto';
import type { PaginationQueryDto } from '#shared/dto/pagination-query.dto';
import {
  assignDriverToCar as assignDriverToCarRequest,
  createCarsBatch as createCarsBatchRequest,
  getCarById,
  getCars,
  unassignDriverFromCar as unassignDriverFromCarRequest,
  updateCar as updateCarRequest,
} from '../api/cars';
import { toCarsBatchCreateError } from '../utils/cars-batch-error';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export const useCarsStore = defineStore('cars', () => {
  const { authenticatedApi } = useApi();

  const driversStore = useDriversStore();

  const page = ref(DEFAULT_PAGE);
  const limit = ref(DEFAULT_LIMIT);

  const paginated = ref<PaginatedCarsResponseDto | null>(null);
  const loading = ref(false);
  const listError = ref<unknown | null>(null);

  const items = computed(() => paginated.value?.data ?? []);
  const meta = computed(() => paginated.value?.meta ?? null);
  /** True after the list has loaded successfully at least once. */
  const listResolved = computed(() => paginated.value !== null);

  const creating = ref(false);
  const updating = ref(false);

  function reset() {
    paginated.value = null;
    listError.value = null;
    loading.value = false;
    creating.value = false;
    updating.value = false;
  }

  async function fetchCars(
    overrides?: Partial<PaginationQueryDto>,
  ): Promise<PaginatedCarsResponseDto> {
    if (overrides?.page !== undefined) page.value = overrides.page;
    if (overrides?.limit !== undefined) limit.value = overrides.limit;
    loading.value = true;
    listError.value = null;
    try {
      const query: PaginationQueryDto = {
        page: page.value,
        limit: limit.value,
      };
      const result = await getCars(authenticatedApi, query);
      paginated.value = result;
      return result;
    } catch (e) {
      listError.value = e;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCarById(id: string): Promise<CarDto | null> {
    const car = await getCarById(authenticatedApi, id);
    if (paginated.value) {
      const exists = paginated.value.data.some((item) => item.id === car.id);
      if (exists) {
        paginated.value = {
          ...paginated.value,
          data: paginated.value.data.map((item) =>
            item.id === car.id ? car : item,
          ),
        };
      }
    }
    return car;
  }

  async function getCarSuggestions(limitValue = 20): Promise<CarDto[]> {
    const response = await getCars(authenticatedApi, {
      page: 1,
      limit: limitValue,
    });
    return response.data;
  }

  async function createCars(payloads: CreateCarDto[]): Promise<CarDto[]> {
    if (payloads.length === 0) return [];
    creating.value = true;
    try {
      const cars = await createCarsBatchRequest(authenticatedApi, {
        cars: payloads,
      });
      await fetchCars();
      return cars;
    } catch (e) {
      const batchErr = toCarsBatchCreateError(e);
      if (batchErr) throw batchErr;
      throw e;
    } finally {
      driversStore.reset();
      creating.value = false;
    }
  }

  async function updateCar(id: string, payload: CreateCarDto): Promise<CarDto> {
    updating.value = true;
    try {
      const updated = await updateCarRequest(authenticatedApi, id, payload);
      if (paginated.value) {
        paginated.value = {
          ...paginated.value,
          data: paginated.value.data.map((car) =>
            car.id === updated.id ? updated : car,
          ),
        };
      }
      return updated;
    } finally {
      updating.value = false;
    }
  }

  async function assignDriverToCar(
    carId: string,
    driverId: string,
  ): Promise<CarDto> {
    updating.value = true;
    try {
      const updated = await assignDriverToCarRequest(
        authenticatedApi,
        carId,
        driverId,
      );
      if (paginated.value) {
        paginated.value = {
          ...paginated.value,
          data: paginated.value.data.map((car) =>
            car.id === updated.id ? updated : car,
          ),
        };
      }
      return updated;
    } finally {
      driversStore.reset();
      updating.value = false;
    }
  }

  async function unassignDriverFromCar(carId: string): Promise<CarDto> {
    updating.value = true;
    try {
      const updated = await unassignDriverFromCarRequest(authenticatedApi, carId);
      if (paginated.value) {
        paginated.value = {
          ...paginated.value,
          data: paginated.value.data.map((car) =>
            car.id === updated.id ? updated : car,
          ),
        };
      }
      return updated;
    } finally {
      driversStore.reset();
      updating.value = false;
    }
  }

  return {
    items,
    meta,
    loading,
    listError,
    creating,
    updating,
    page,
    limit,
    listResolved,
    reset,
    fetchCars,
    fetchCarById,
    getCarSuggestions,
    createCars,
    updateCar,
    assignDriverToCar,
    unassignDriverFromCar,
  };
});
