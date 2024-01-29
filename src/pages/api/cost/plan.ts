import wretch from "wretch";
import FormDataAddon from "wretch/addons/formData";

import { env } from "@/env.mjs";
import { AuthNextApiRequest, NextApiResponse } from "@/server/middleware/auth";
import { router } from "@/server/middleware/router";
import Cache from "@/server/util/cache";

import type { RouteToResponse, RouteToResponseData } from "@/types/server";

const routeLogic = async (req: AuthNextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") return { ok: false, code: 404 };
  const query = req.body.query as string;
  const key = req.body.key as string | undefined;
  const blob = new Blob([JSON.stringify(query)], { type: "plain/text" });

  const cacheHandler = await Cache("infra:costs", key);

  if (key) {
    const cachedata = await cacheHandler.get();
    if (cachedata) {
      res.setHeader("X-ROCETTA-CACHE", "HIT");
      return { ok: true, data: cachedata };
    }
  }

  const data = await wretch("https://pricing.api.infracost.io/breakdown")
    .addon(FormDataAddon)
    .accept("application/json")
    .headers({ "X-Api-Key": env.INFRA_COST_API_KEY })
    .formData({
      "ci-platform": "atlantis",
      path: blob,
      format: "json",
    })
    .post()
    .json();

  if (key) cacheHandler.set(data, { ex: 86400 });

  res.setHeader("X-ROCETTA-CACHE", "MISS");
  return {
    ok: true,
    data: data,
  };
};

export default router(routeLogic);

export type Response = RouteToResponse<typeof routeLogic>;
export type ResponseData = RouteToResponseData<typeof routeLogic>;
