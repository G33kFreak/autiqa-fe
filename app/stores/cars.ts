import { defineStore } from 'pinia';
import type { CarDto } from '#shared/dto/car.dto';
import type { CreateCarDto } from '#shared/dto/create-car.dto';
import { createCar as createCarRequest, getCars } from '../api/cars';

export const useCarsStore = defineStore('cars', () => {
  const { authenticatedApi } = useApi();

  async function fetchCars(): Promise<CarDto[]> {
    const result = await getCars(authenticatedApi, { page: 1, limit: 100 });
    return result.data;
  }

  async function createCar(payload: CreateCarDto): Promise<CarDto> {
    return createCarRequest(authenticatedApi, payload);
  }

  return { fetchCars, createCar };
});
