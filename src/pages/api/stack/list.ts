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
    const service = <string>req.query.service;
    const provider = <string>req.query.provider;
    const from = parseInt(<string>req.query.from ?? "0");
    const to = parseInt(<string>req.query.to ?? "10");
    const include = <string[]>req.query.include ?? [];

    const typeSearch = () => {
      if (service && provider) return `${provider}::${service}`;
      if (service) return service;
      if (provider) return provider;
      if (!service && !provider) return "";
      return "";
    };

    const list = await db
      .selectFrom("Stack")
      .select([
        "id",
        "name",
        "type",
        "status",
        "createdAt",
        "updatedAt",
        "input",
        "projectId",
        "Stack.teamId",
      ])
      .innerJoin("UsersOnTeams", "UsersOnTeams.teamId", "Stack.teamId")
      .where("UsersOnTeams.userId", "=", id)
      .where("type", "like", `%${typeSearch()}%`)
      .where("Stack.projectId", "=", projectId)
      // Don't include deleted stacks unless specified
      .$if(!include.includes("deleted"), (q) =>
        q.where("Stack.status", "!=", "DELETED")
      )
      .orderBy("createdAt", "desc")
      .limit(to - from)
      .offset(from)
      .execute();

    return {
      ok: true,
      data: list,
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
