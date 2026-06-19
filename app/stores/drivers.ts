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

  /** Suggested drivers for an assignment picker (no query yet). */
  async function getDriverSuggestions(limit = 8): Promise<DriverDto[]> {
    const all = await fetchDrivers();
    return all.slice(0, limit);
  }

  /** Client-side driver search over name / email / phone. */
  async function searchDrivers(query: string, limit = 8): Promise<DriverDto[]> {
    const q = query.trim().toLowerCase();
    if (!q) return getDriverSuggestions(limit);
    const all = await fetchDrivers();
    return all
      .filter((d) =>
        [`${d.firstName} ${d.lastName}`, d.email, d.phoneNumber]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(q)),
      )
      .slice(0, limit);
  }

  async function fetchDriverById(id: string): Promise<DriverDto | null> {
    const all = await fetchDrivers();
    return all.find((d) => d.id === id) ?? null;
  }

  return {
    fetchDrivers,
    createDriver,
    getDriverSuggestions,
    searchDrivers,
    fetchDriverById,
  };
});
