import { KnownError } from "./error";

interface Params {
  [key: string]: any | undefined;
}

export default function check<T extends Params>(params: T) {
  const missingKeys: string[] = [];
  for (const key of Object.keys(params))
    if (
      params[key as keyof T] === undefined ||
      params[key as keyof T] === null
    ) {
      missingKeys.push(key);
    }
  if (missingKeys.length)
    throw new KnownError(`${missingKeys.join(", ")} is required`);
}
