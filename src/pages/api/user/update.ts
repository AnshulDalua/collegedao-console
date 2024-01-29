import { Pattern as P } from "ts-pattern";

import { db } from "@/server/db";
import {
  authMiddlewareEdge,
  EdgeAuthNextApiRequest,
} from "@/server/middleware/auth";
import { routerEdge } from "@/server/middleware/router";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";

import type { RouteToResponse, RouteToResponseData } from "@/types/server";
import type { NextResponse } from "next/server";

const routeLogic = async (req: EdgeAuthNextApiRequest, _: NextResponse) => {
  if (req.method !== "POST") return { ok: false, code: 404 };
  try {
    const id = req.middleware.id;
    const body = await req.json();
    const { name } = body;

    const user = await db
      .updateTable("User")
      .set({ name: name, updatedAt: new Date() })
      .where("User.id", "=", id)
      .executeTakeFirst();

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
