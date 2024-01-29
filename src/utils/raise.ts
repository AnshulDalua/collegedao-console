import { KnownError } from "./error";

/** @description Ensure beginning part is not null or undefined. If it is throws a KnownError  */
export default function raise(error: string): never {
  throw new KnownError(error);
}
