export class KnownError extends Error {
  constructor(public message: string) {
    super(message);
  }
}
