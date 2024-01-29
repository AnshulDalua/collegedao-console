import { Pattern as P } from "ts-pattern";

import { authMiddlewareEdge } from "@/server/middleware/auth";
import { routerEdge } from "@/server/middleware/router";
import Data from "@/server/util/data";
import { matchAndLog } from "@/server/util/matchAndLog";
import { notification } from "@/types/notifications";
import { KnownError } from "@/utils/error";
import raise from "@/utils/raise";

import type { EdgeAuthNextApiRequest } from "@/server/middleware/auth";
import type { Notifications } from "@/types/notifications";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";
import type { NextResponse } from "next/server";

const routeLogic = async (req: EdgeAuthNextApiRequest, _: NextResponse) => {
  if (req.method !== "POST") return { ok: false, code: 404 };
  try {
    const projectId =
      <string>req.query.projectId ?? raise("Project ID not found");
    const id = parseInt(<string>req.query.id ?? raise("ID not found"));
    const body = await req.json();

    const data = new Data<Notifications>("notifications", projectId);

    body.t = new Date(body.t);
    const newNotifications = await notification.safeParse(body);

    if (!newNotifications.success) {
      return {
        ok: false,
        error: "Invalid notification",
      };
    }

    const info = await data.update((value) => {
      const get = value?.[id];
      if (!get) return value ?? [];
      value[id] = newNotifications.data;
      return value;
    });

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
