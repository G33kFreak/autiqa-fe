import { defineStore } from 'pinia';
import { FetchError } from 'ofetch';
import { StatusCodes } from 'http-status-codes';
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
import { CarNotFoundError } from '~/utils/car-errors';

export const useCarsStore = defineStore('cars', () => {
  const { authenticatedApi } = useApi();

  async function fetchCars(): Promise<CarDto[]> {
    const result = await getCars(authenticatedApi, { page: 1, limit: 100 });
    return result.data;
  }

  async function createCar(payload: CreateCarDto): Promise<CarDto> {
    return createCarRequest(authenticatedApi, payload);
  }

  /** Resolve one car. A 404 is a genuine "no such car"; anything else bubbles up. */
  async function fetchCarById(carId: string): Promise<CarDto> {
    try {
      return await getCarById(authenticatedApi, carId);
    } catch (error) {
      if (
        error instanceof FetchError &&
        (error.status ?? error.statusCode) === StatusCodes.NOT_FOUND
      ) {
        throw new CarNotFoundError();
      }
      throw error;
    }
  }

  async function updateCar(
    carId: string,
    patch: Partial<CreateCarDto>,
  ): Promise<CarDto> {
    return updateCarRequest(authenticatedApi, carId, patch);
  }

  async function assignDriver(
    carId: string,
    driver: DriverDto,
  ): Promise<CarDto> {
    return assignDriverRequest(authenticatedApi, carId, driver.id);
  }

  async function unassignDriver(carId: string): Promise<CarDto> {
    return unassignDriverRequest(authenticatedApi, carId);
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
