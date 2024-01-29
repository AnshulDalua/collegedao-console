import { Pattern as P } from "ts-pattern";

import { stackWithUserIdandId } from "@/server/db/relations";
import { inngest, inngestInfra } from "@/server/inngest";
import { authMiddlewareEdge } from "@/server/middleware/auth";
import { routerEdge } from "@/server/middleware/router";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";
import raise from "@/utils/raise";

import type { EdgeAuthNextApiRequest } from "@/server/middleware/auth";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";
import type { NextResponse } from "next/server";

const routeLogic = async (req: EdgeAuthNextApiRequest, _: NextResponse) => {
  if (req.method !== "POST") return { ok: false, code: 404 };
  try {
    const userId = req.middleware.id;
    const projectId =
      <string>req.query.projectId ?? raise("Project ID not found");
    const body = await req.json();
    const stackId = <string>body.stackId ?? raise("stackId is required");

    const stack =
      (await stackWithUserIdandId(stackId, userId)) ??
      raise("This stack does not exist or you do not have access to it.");

    if (stack.status === "DELETED") raise("This project is deleted");

    await inngestInfra.send({
      name: "infra/stack.refresh",
      data: { stackId, userId },
      user: { external_id: userId },
    });

    await inngest.send({
      name: "console/notifications",
      data: {
        projectId: projectId,
        notification: {
          t: new Date(),
          m: `Stack ${stack.name} has been queued for refresh`,
          s: "loading",
          v: false,
        },
        key: stack.type,
      },
      user: { external_id: userId },
    });

    return {
      ok: true,
      data: {
        message: "Stack refresh started",
      },
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
