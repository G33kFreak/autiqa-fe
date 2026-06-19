import { defineStore } from 'pinia';
import type {
  LedgerEntryDto,
  CreateLedgerEntryDto,
} from '#shared/dto/ledger-entry.dto';
import {
  createLedgerEntry,
  deleteLedgerEntry,
  getCarLedger,
  updateLedgerEntry,
} from '../api/ledger';
import { demoLedger, withDemoFallback } from '~/utils/car-demo';

/** Unified per-car money ledger (income + expense). Thin, no caching. */
export const useLedgerStore = defineStore('ledger', () => {
  const { authenticatedApi } = useApi();

  function list(carId: string): Promise<LedgerEntryDto[]> {
    return withDemoFallback(
      () => getCarLedger(authenticatedApi, carId),
      () => demoLedger.list(carId),
    );
  }

  async function create(
    carId: string,
    body: CreateLedgerEntryDto,
  ): Promise<LedgerEntryDto[]> {
    await withDemoFallback(
      () => createLedgerEntry(authenticatedApi, carId, body),
      () => demoLedger.add(carId, body),
    );
    return list(carId);
  }

  async function update(
    carId: string,
    entryId: string,
    body: CreateLedgerEntryDto,
  ): Promise<LedgerEntryDto[]> {
    await withDemoFallback(
      () => updateLedgerEntry(authenticatedApi, carId, entryId, body),
      () => demoLedger.update(carId, entryId, body),
    );
    return list(carId);
  }

  async function remove(
    carId: string,
    entryId: string,
  ): Promise<LedgerEntryDto[]> {
    await withDemoFallback(
      () => deleteLedgerEntry(authenticatedApi, carId, entryId),
      () => demoLedger.remove(carId, entryId),
    );
    return list(carId);
  }

  return { list, create, update, remove };
});
