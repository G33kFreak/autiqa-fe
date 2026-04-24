import { StatusCodes } from 'http-status-codes';
import { FetchError } from 'ofetch';

export class CarsBatchCreateError extends Error {
  readonly failedIndices: number[];

  constructor(message: string, failedIndices: number[]) {
    super(message);
    this.name = 'CarsBatchCreateError';
    this.failedIndices = failedIndices;
  }
}

/**
 * Maps a 400 batch-create response into {@link CarsBatchCreateError}, or returns null.
 */
export function toCarsBatchCreateError(e: unknown): CarsBatchCreateError | null {
  if (!(e instanceof FetchError)) return null;
  const status = e.status ?? e.statusCode;
  if (status !== StatusCodes.BAD_REQUEST) return null;
  const data = e.data as { failedIndices?: unknown; message?: unknown } | undefined;
  if (!data || !Array.isArray(data.failedIndices)) return null;
  const failedIndices = data.failedIndices.filter((i): i is number =>
    typeof i === 'number' && Number.isInteger(i) && i >= 0,
  );
  if (failedIndices.length === 0) return null;
  return new CarsBatchCreateError(
    typeof data.message === 'string' ? data.message : '',
    failedIndices,
  );
}
