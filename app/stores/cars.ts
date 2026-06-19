import { defineStore } from 'pinia';
import type { CarDto } from '#shared/dto/car.dto';
import type { CreateCarDto } from '#shared/dto/create-car.dto';
import type { DriverDto } from '#shared/dto/driver.dto';
import {
  assignDriverToCar as assignDriverRequest,
  createCar as createCarRequest,
  getCarById,
  getCars,
  unassignDriverFromCar as unassignDriverRequest,
  updateCar as updateCarRequest,
} from '../api/cars';
import { CarNotFoundError, demoCar, withDemoFallback } from '~/utils/car-demo';

export const useCarsStore = defineStore('cars', () => {
  const { authenticatedApi } = useApi();

  async function fetchCars(): Promise<CarDto[]> {
    const result = await getCars(authenticatedApi, { page: 1, limit: 100 });
    return result.data;
  }

  async function createCar(payload: CreateCarDto): Promise<CarDto> {
    return createCarRequest(authenticatedApi, payload);
  }

  /**
   * Resolve one car. Detail endpoint first; if that fails, fall back to the
   * list. A real list that lacks the id is a genuine 404 (CarNotFoundError); if
   * the list is also unreachable, the backend is absent and we synthesize a
   * demo car so the screen stays usable. Demo edits are layered on top.
   */
  async function fetchCarById(carId: string): Promise<CarDto> {
    try {
      const dto = await getCarById(authenticatedApi, carId);
      return demoCar.applyOverride(dto);
    } catch {
      let list: CarDto[] | null;
      try {
        list = await fetchCars();
      } catch {
        list = null;
      }
      if (list) {
        const found = list.find((c) => c.id === carId);
        if (found) return demoCar.applyOverride(found);
        throw new CarNotFoundError();
      }
      return demoCar.applyOverride(demoCar.synthesize(carId));
    }
  }

  async function updateCar(
    carId: string,
    patch: Partial<CreateCarDto>,
  ): Promise<CarDto> {
    return withDemoFallback(
      () => updateCarRequest(authenticatedApi, carId, patch),
      async () => {
        demoCar.setOverride(carId, {
          ...(patch.model !== undefined ? { model: patch.model } : {}),
          ...(patch.vin !== undefined ? { vin: patch.vin || null } : {}),
          ...(patch.plateNumber !== undefined
            ? { plateNumber: patch.plateNumber || null }
            : {}),
          ...(patch.inspectionValidUntil !== undefined
            ? { inspectionValidUntil: patch.inspectionValidUntil || null }
            : {}),
        });
        return fetchCarById(carId);
      },
    );
  }

  async function assignDriver(
    carId: string,
    driver: DriverDto,
  ): Promise<CarDto> {
    return withDemoFallback(
      () => assignDriverRequest(authenticatedApi, carId, driver.id),
      async () => {
        demoCar.setOverride(carId, { driver });
        return fetchCarById(carId);
      },
    );
  }

  async function unassignDriver(carId: string): Promise<CarDto> {
    return withDemoFallback(
      () => unassignDriverRequest(authenticatedApi, carId),
      async () => {
        demoCar.setOverride(carId, { driver: null });
        return fetchCarById(carId);
      },
    );
  }

  return {
    fetchCars,
    createCar,
    fetchCarById,
    updateCar,
    assignDriver,
    unassignDriver,
  };
});
