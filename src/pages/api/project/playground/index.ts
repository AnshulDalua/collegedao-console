import { Pattern as P } from "ts-pattern";

import { authMiddlewareEdge } from "@/server/middleware/auth";
import { routerEdge } from "@/server/middleware/router";
import Data from "@/server/util/data";
import { matchAndLog } from "@/server/util/matchAndLog";
import { PlaygroundData, playgroundData } from "@/types/playground";
import { KnownError } from "@/utils/error";
import raise from "@/utils/raise";

import type { EdgeAuthNextApiRequest } from "@/server/middleware/auth";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";
import type { NextResponse } from "next/server";

const routeLogic = async (req: EdgeAuthNextApiRequest, _: NextResponse) => {
  if (req.method !== "GET") return { ok: false, code: 404 };
  try {
    const projectId =
      <string>req.query.projectId ?? raise("Project ID not found");

    const data = new Data<PlaygroundData>("playground", projectId).addZod(
      playgroundData
    );
    const info = await data.get();

    return {
      ok: true,
      data: info ?? {
        edges: [],
        nodes: [],
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
