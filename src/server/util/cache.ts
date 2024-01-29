import redis from "@/server/db/redis";

import type { SetCommandOptions } from "@upstash/redis/types/pkg/commands/set";

export default async function Cache<T>(...key: (string | undefined)[]) {
  const fixedKey = key.filter(Boolean).join(":");
  return {
    get: () => redis.get<T>(fixedKey),
    set: (value: T, opts?: SetCommandOptions) =>
      redis.set<T>(fixedKey, value, opts),
  };
}
