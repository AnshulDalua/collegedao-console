import { Pattern as P } from "ts-pattern";
import { NextResponse } from "next/server";

import { db } from "@/server/db";
import {
  withPersonalTeam,
  withProjectsAndCredentials,
} from "@/server/db/relations";
import {
  authMiddlewareEdge,
  EdgeAuthNextApiRequest,
} from "@/server/middleware/auth";
import { routerEdge } from "@/server/middleware/router";
import { credentialsSafe } from "@/server/util/credentials";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";

import type { RouteToResponse, RouteToResponseData } from "@/types/server";

const routeLogic = async (req: EdgeAuthNextApiRequest, _: NextResponse) => {
  if (req.method !== "GET") return { ok: false, code: 404 };
  try {
    const id = req.middleware.id;
    if (!id) throw new KnownError("Token not found");

    const user = await db
      .selectFrom("User")
      .select([
        "User.id",
        "name",
        "email",
        "password",
        "createdAt",
        "updatedAt",
      ])
      .select((ep) => [withProjectsAndCredentials(ep), withPersonalTeam(ep)])
      .where("User.id", "=", id)
      .executeTakeFirst();
    if (!user) throw new KnownError("User not found");

    user.password = "";
    credentialsSafe(user.projects);

    return { ok: true, data: user };
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
