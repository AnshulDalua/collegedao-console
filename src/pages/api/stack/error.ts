import { Pattern as P } from "ts-pattern";
import { z } from "zod";

import { db } from "@/server/db";
import { authMiddlewareEdge } from "@/server/middleware/auth";
import { routerEdge } from "@/server/middleware/router";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";
import raise from "@/utils/raise";

import type { EdgeAuthNextApiRequest } from "@/server/middleware/auth";
import type { stackError } from "@/types/infra/src/types/error";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";
import type { NextResponse } from "next/server";

const routeLogic = async (req: EdgeAuthNextApiRequest, _: NextResponse) => {
  if (req.method !== "GET") return { ok: false, code: 404 };
  try {
    const id = req.middleware.id;
    const stackId = <string>req.query.stackId ?? raise("stackId is required");

    const stack =
      (await db
        .selectFrom("Stack")
        .select(["Stack.error"])
        .innerJoin("UsersOnTeams", "UsersOnTeams.teamId", "Stack.teamId")
        .where("Stack.id", "=", stackId)
        .where("UsersOnTeams.userId", "=", id)
        .executeTakeFirst()) ?? raise("Stack not found");

    return { ok: true, data: stack.error as z.infer<typeof stackError> };
  } catch (err) {
    return {
      ok: false,
      error: matchAndLog(err)
        .with(P.instanceOf(KnownError), (err) => err.message)
        .otherwise(() => "Something went wrong"),
    };
  }
};

export default authMiddlewareEdge(routerEdge(routeLogic));

export const config = {
  runtime: "edge",
  regions: ["pdx1"],
};

export type Response = RouteToResponse<typeof routeLogic>;
export type ResponseData = RouteToResponseData<typeof routeLogic>;
