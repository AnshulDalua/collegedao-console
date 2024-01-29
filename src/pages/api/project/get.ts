import { Pattern as P } from "ts-pattern";

import { db } from "@/server/db";
import { withCredentials } from "@/server/db/relations";
import {
  authMiddlewareEdge,
  EdgeAuthNextApiRequest,
} from "@/server/middleware/auth";
import { routerEdge } from "@/server/middleware/router";
import { credentialsSafe } from "@/server/util/credentials";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";
import raise from "@/utils/raise";

import type { RouteToResponse, RouteToResponseData } from "@/types/server";
import type { NextResponse } from "next/server";

const routeLogic = async (req: EdgeAuthNextApiRequest, _: NextResponse) => {
  if (req.method !== "GET") return { ok: false, code: 404 };
  try {
    const id = req.middleware.id;
    const projectId = req.query.projectId as string;
    const userId = req.query.userId as string;
    if (!id) throw new KnownError("Token not found");

    const project =
      (await db
        .selectFrom("Project")
        .select(["Project.id", "name", "createdAt", "updatedAt", "teamId"])
        .select((eb) => [withCredentials(eb)])
        .innerJoin("Team", "Team.id", "Project.teamId")
        .innerJoin("UsersOnTeams", "UsersOnTeams.teamId", "Team.id")
        .where("Project.id", "=", projectId)
        .where("UsersOnTeams.userId", "=", userId)
        .executeTakeFirst()) ?? raise("Project not found");

    credentialsSafe(project);

    return { ok: true, data: project };
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
