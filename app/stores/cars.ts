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

  async function loadCars(): Promise<PaginatedCarsResponseDto | null> {
    const query: PaginationQueryDto = {
      page: page.value,
      limit: limit.value,
    };
    return await getCars(authenticatedApi, query);
  }

  const vm = useLazyViewModel<PaginatedCarsResponseDto>({
    load: loadCars,
  });

  const items = computed(() => vm.data.value?.data ?? []);
  const meta = computed(() => vm.data.value?.meta ?? null);
  /** True after the list has been loaded at least once (success or empty page). */
  const listResolved = computed(() => vm.data.value !== undefined);

  const creating = ref(false);
  const updating = ref(false);

  async function getViewModel(): Promise<PaginatedCarsResponseDto | null> {
    return vm.getViewModel();
  }

  function reset() {
    vm.reset();
    creating.value = false;
    updating.value = false;
  }

  async function getViewModelById(id: string): Promise<CarDto | null> {
    const car = await getCarById(authenticatedApi, id);
    if (vm.data.value) {
      const exists = vm.data.value.data.some((item) => item.id === car.id);
      if (exists) {
        vm.data.value = {
          ...vm.data.value,
          data: vm.data.value.data.map((item) =>
            item.id === car.id ? car : item,
          ),
        };
      }
    }
    return car;
  }

  /**
   * Refetch for the current (or overridden) page/limit — clears the lazy cache first.
   */
  async function fetchCars(overrides?: Partial<PaginationQueryDto>) {
    if (overrides?.page !== undefined) page.value = overrides.page;
    if (overrides?.limit !== undefined) limit.value = overrides.limit;
    vm.reset();
    return vm.getViewModel();
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
      if (vm.data.value) {
        vm.data.value = {
          ...vm.data.value,
          data: vm.data.value.data.map((car) =>
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
      if (vm.data.value) {
        vm.data.value = {
          ...vm.data.value,
          data: vm.data.value.data.map((car) =>
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
      if (vm.data.value) {
        vm.data.value = {
          ...vm.data.value,
          data: vm.data.value.data.map((car) =>
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
    loading: vm.loading,
    creating,
    updating,
    page,
    limit,
    listResolved,
    getViewModel,
    reset,
    getViewModelById,
    fetchCars,
    getCarSuggestions,
    createCars,
    updateCar,
    assignDriverToCar,
    unassignDriverFromCar,
  };
});
