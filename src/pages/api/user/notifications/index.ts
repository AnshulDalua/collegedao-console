import { Pattern as P } from "ts-pattern";

import { authMiddlewareEdge } from "@/server/middleware/auth";
import { routerEdge } from "@/server/middleware/router";
import Data from "@/server/util/data";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";
import raise from "@/utils/raise";

import type { EdgeAuthNextApiRequest } from "@/server/middleware/auth";
import type { Notifications } from "@/types/notifications";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";
import type { NextResponse } from "next/server";

const routeLogic = async (req: EdgeAuthNextApiRequest, _: NextResponse) => {
  if (req.method !== "GET") return { ok: false, code: 404 };
  try {
    const projectId =
      <string>req.query.projectId ?? raise("Project ID not found");

    const data = new Data<Notifications>("notifications", projectId);
    const info = await data.get();

    if (!info) {
      await data.set([]);
      return { ok: true, data: [] };
    }
    if (info.length > 30) {
      await data.update((value) =>
        (value ?? []).filter((o) => o.v).slice(0, 30)
      );
    }

    return { ok: true, data: info };
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
