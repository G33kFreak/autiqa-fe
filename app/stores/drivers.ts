import { defineStore } from 'pinia';
import type { DriverDto } from '#shared/dto/driver.dto';
import type { CreateDriverDto } from '#shared/dto/create-driver.dto';
import { createDriver as createDriverRequest, getDrivers } from '../api/drivers';

export const useDriversStore = defineStore('drivers', () => {
  const { authenticatedApi } = useApi();

  async function fetchDrivers(): Promise<DriverDto[]> {
    const result = await getDrivers(authenticatedApi, { page: 1, limit: 100 });
    return result.data;
  }

  async function createDriver(payload: CreateDriverDto): Promise<DriverDto> {
    return createDriverRequest(authenticatedApi, payload);
  }

  return { fetchDrivers, createDriver };
});
