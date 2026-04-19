import { defineStore } from 'pinia';
import type { CarDto } from '#shared/dto/car.dto';
import type { CreateCarDto } from '#shared/dto/create-car.dto';
import type { PaginationMetaDto } from '#shared/dto/pagination-meta.dto';
import type { PaginationQueryDto } from '#shared/dto/pagination-query.dto';
import { createCar as createCarRequest, getCars } from '../api/cars';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export const useCarsStore = defineStore('cars', () => {
  const { authenticatedApi } = useApi();

  const items = ref<CarDto[]>([]);
  const meta = ref<PaginationMetaDto | null>(null);
  const loading = ref(false);
  const creating = ref(false);
  const page = ref(DEFAULT_PAGE);
  const limit = ref(DEFAULT_LIMIT);

  async function fetchCars(overrides?: Partial<PaginationQueryDto>) {
    if (overrides?.page !== undefined) page.value = overrides.page;
    if (overrides?.limit !== undefined) limit.value = overrides.limit;

    const query: PaginationQueryDto = {
      page: page.value,
      limit: limit.value,
    };

    loading.value = true;
    try {
      const res = await getCars(authenticatedApi, query);
      items.value = res.data;
      meta.value = res.meta;
    } finally {
      loading.value = false;
    }
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
    loading,
    creating,
    page,
    limit,
    fetchCars,
    createCar,
  };
});
