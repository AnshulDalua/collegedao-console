import { Pattern as P } from "ts-pattern";

import { db } from "@/server/db";
import { authMiddlewareEdge } from "@/server/middleware/auth";
import { routerEdge } from "@/server/middleware/router";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";
import raise from "@/utils/raise";

import type { EdgeAuthNextApiRequest } from "@/server/middleware/auth";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";
import type { NextResponse } from "next/server";

const routeLogic = async (req: EdgeAuthNextApiRequest, _: NextResponse) => {
  if (req.method !== "GET") return { ok: false, code: 404 };
  try {
    const id = req.middleware.id;
    const projectId =
      <string>req.query.projectId ?? raise("projectId is required");
    const stackId = <string>req.query.stackId ?? raise("stackId is required");

    const stack =
      (await db
        .selectFrom("Stack")
        .select([
          "id",
          "name",
          "type",
          "status",
          "input",
          "createdAt",
          "updatedAt",
          "error",
        ])
        .innerJoin("UsersOnTeams", "UsersOnTeams.teamId", "Stack.teamId")
        .where("Stack.id", "=", stackId)
        .where("UsersOnTeams.userId", "=", id)
        .where("Stack.projectId", "=", projectId)
        .executeTakeFirst()) ?? raise("Stack not found");

    return {
      ok: true,
      data: stack,
    };
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
