import { z } from "zod";

import redis from "@/server/db/redis";

import type { SetCommandOptions } from "@upstash/redis/types/pkg/commands/set";

export default class Data<T> {
  #key: string;
  #unique: string;
  #zod: z.ZodType<T> | null;

  constructor(...key: (string | undefined)[]) {
    this.#key = key.filter(Boolean).join(":");
    this.#zod = null;
    this.#unique = "";
  }

  key = () => `${this.#key}:${this.#unique}`;

  addZod = (zod: z.ZodType<T>) => {
    this.#zod = zod;
    return this;
  };

  unique = (id: string) => {
    this.#unique = id;
    return this;
  };

  get = async () => redis.get<T>(this.key());

  set = async (value: T, opts?: SetCommandOptions) => {
    if (this.#zod) value = this.#zod.parse(value);
    return redis.set<T>(this.key(), value, opts);
  };

  update = async (fn: (value: T | null) => T, opts?: SetCommandOptions) => {
    let get = await this.get();
    if (this.#zod) get = await this.#zod.parseAsync(get);
    const value = fn(get);
    await this.set(value, opts);
    return this.get();
  };

  delete = async () => redis.del(this.key());
}
