import { Kysely } from "kysely";
import { PlanetScaleDialect } from "kysely-planetscale";

import { env } from "@/env.mjs";

import type { DB } from "kysely-codegen";

export const db = new Kysely<DB>({
  dialect: new PlanetScaleDialect({
    url: env.DATABASE_URL,
    fetch,
  }),
  log:
    env.NODE_ENV === "development"
      ? (event) => {
          if (event.level === "query")
            console.log(`\u001B[33mquery\u001B[0m - ${event.query.sql}`);
        }
      : undefined,
});
