import type { ApiClient } from './types';
import type {
  LedgerEntryDto,
  CreateLedgerEntryDto,
} from '#shared/dto/ledger-entry.dto';

/** List a car's ledger entries (income + expenses), newest first. */
export function getCarLedger(client: ApiClient, carId: string) {
  return client<LedgerEntryDto[]>(`/cars/${carId}/ledger`, { method: 'GET' });
}

/** Create a ledger entry. */
export function createLedgerEntry(
  client: ApiClient,
  carId: string,
  body: CreateLedgerEntryDto,
) {
  return client<LedgerEntryDto>(`/cars/${carId}/ledger`, {
    method: 'POST',
    body,
  });
}

/** Update a ledger entry. */
export function updateLedgerEntry(
  client: ApiClient,
  carId: string,
  entryId: string,
  body: CreateLedgerEntryDto,
) {
  return client<LedgerEntryDto>(`/cars/${carId}/ledger/${entryId}`, {
    method: 'PATCH',
    body,
  });
}

/** Delete a ledger entry. */
export function deleteLedgerEntry(
  client: ApiClient,
  carId: string,
  entryId: string,
) {
  return client<unknown>(`/cars/${carId}/ledger/${entryId}`, { method: 'DELETE' });
}
