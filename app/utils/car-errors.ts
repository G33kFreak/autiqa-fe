/** Thrown when the backend responds but has no car with the given id (404). */
export class CarNotFoundError extends Error {
  constructor() {
    super('CAR_NOT_FOUND');
    this.name = 'CarNotFoundError';
  }
}
