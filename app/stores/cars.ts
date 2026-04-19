import { defineStore } from 'pinia';
import type { CarDto } from '#shared/dto/car.dto';
import type { CreateCarDto } from '#shared/dto/create-car.dto';
import type { PaginatedCarsResponseDto } from '#shared/dto/paginated-cars-response.dto';
import type { PaginationQueryDto } from '#shared/dto/pagination-query.dto';
import { createCar as createCarRequest, getCars } from '../api/cars';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export const useCarsStore = defineStore('cars', () => {
  const { authenticatedApi } = useApi();

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

  async function getViewModel(): Promise<PaginatedCarsResponseDto | null> {
    return vm.getViewModel();
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

  async function createCar(payload: CreateCarDto): Promise<CarDto> {
    creating.value = true;
    try {
      const car = await createCarRequest(authenticatedApi, payload);
      await fetchCars();
      return car;
    } finally {
      creating.value = false;
    }
  }

  return {
    items,
    meta,
    loading: vm.loading,
    creating,
    page,
    limit,
    listResolved,
    getViewModel,
    fetchCars,
    createCar,
  };
});
