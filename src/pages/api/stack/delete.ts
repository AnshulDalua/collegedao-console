import { Pattern as P } from "ts-pattern";

import { db } from "@/server/db";
import { stackWithUserIdandId } from "@/server/db/relations";
import { inngest, inngestInfra } from "@/server/inngest";
import { authMiddlewareEdge } from "@/server/middleware/auth";
import { routerEdge } from "@/server/middleware/router";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";
import raise from "@/utils/raise";

import type { EdgeAuthNextApiRequest } from "@/server/middleware/auth";
import type { StackDeleteProps } from "@/types/infra/src/types/builder";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";
import type { NextResponse } from "next/server";

const routeLogic = async (req: EdgeAuthNextApiRequest, _: NextResponse) => {
  if (req.method !== "DELETE") return { ok: false, code: 404 };
  try {
    const userId = req.middleware.id;
    const projectId = req.query.projectId as string;
    const forced = req.query.forced === "true";
    const body = await req.json();
    const stackId = <string>body.stackId ?? raise("stackId is required");
    const args = <StackDeleteProps["args"] | undefined>body.args;

    const stack =
      (await stackWithUserIdandId(stackId, userId)) ??
      raise("This project does not exist or you do not have access to it.");

    // if (stack.status === "QUEUED" || forced) {
    //   await setStackToDelete(stackId, userId);
    //   return {
    //     ok: true,
    //     data: { message: `Removing the Stack ${forced ? "queued" : "forced"}` },
    //   };
    // }

    await db
      .updateTable("Stack")
      .set({
        status: "QUEUED" as const,
        updatedAt: new Date(),
      })
      .where("Stack.id", "=", stackId)
      .execute();

    await inngestInfra.send({
      id: `stack-delete-${stackId}`,
      name: "infra/stack.delete",
      data: { stackId, userId, args },
      user: { external_id: userId },
    });

    await inngest.send({
      name: "console/notifications",
      data: {
        projectId: projectId,
        notification: {
          t: new Date(),
          m: `Stack ${stack.name} has been queued for deletion`,
          s: "loading",
          v: false,
        },
        key: stack.type,
      },
      user: { external_id: userId },
    });

    return {
      ok: true,
      data: { message: "Removing the Stack Queued" },
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
