import wretch from "wretch";
import { z } from "zod";

import { env } from "@/env.mjs";
import { AuthNextApiRequest, NextApiResponse } from "@/server/middleware/auth";
import { router } from "@/server/middleware/router";

import type { RouteToResponse, RouteToResponseData } from "@/types/server";

const routeLogic = async (req: AuthNextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") return { ok: false, code: 404 };
  try {
    const query = z.string().parse(req.query.query);
    const data = await wretch("https://pricing.api.infracost.io/graphql")
      .accept("application/json")
      .headers({
        "X-Api-Key": env.INFRA_COST_API_KEY,
      })
      .post({ query })
      .json();

    res.setHeader("Cache-Control", "public, max-age=864000");

    return {
      ok: true,
      data: data,
    };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
};

export default router(routeLogic);

export type Response = RouteToResponse<typeof routeLogic>;
export type ResponseData = RouteToResponseData<typeof routeLogic>;
