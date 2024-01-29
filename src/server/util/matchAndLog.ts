import { match } from "ts-pattern";

export function matchAndLog<T>(err: T) {
  console.error(err);
  return match<T>(err);
}
