import { StatusCodes } from 'http-status-codes';
import { FetchError } from 'ofetch';

export class DriversBatchCreateError extends Error {
  readonly failedIndices: number[];

  constructor(message: string, failedIndices: number[]) {
    super(message);
    this.name = 'DriversBatchCreateError';
    this.failedIndices = failedIndices;
  }
}

/**
 * Maps a 400 batch-create response into {@link DriversBatchCreateError}, or returns null.
 */
export function toDriversBatchCreateError(e: unknown): DriversBatchCreateError | null {
  if (!(e instanceof FetchError)) return null;
  const status = e.status ?? e.statusCode;
  if (status !== StatusCodes.BAD_REQUEST) return null;
  const data = e.data as { failedIndices?: unknown; message?: unknown } | undefined;
  if (!data || !Array.isArray(data.failedIndices)) return null;
  const failedIndices = data.failedIndices.filter((i): i is number =>
    typeof i === 'number' && Number.isInteger(i) && i >= 0,
  );
  if (failedIndices.length === 0) return null;
  return new DriversBatchCreateError(
    typeof data.message === 'string' ? data.message : '',
    failedIndices,
  );
}
