import { Pattern as P } from "ts-pattern";
import { z } from "zod";

import redis from "@/server/db/redis";
import { routerEdge } from "@/server/middleware/router";
import { sign } from "@/server/util/jwt";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";
import raise from "@/utils/raise";

import type {
  EdgeAuthNextApiRequest,
  NextResponse,
  RouteToResponse,
  RouteToResponseData,
} from "@/types/server";

const login = z.object({
  email: z.string().email().max(255),
  code: z.string().max(6).min(6),
  keepAlive: z.boolean().optional(),
});

const routeLogic = async (req: EdgeAuthNextApiRequest, res: NextResponse) => {
  if (req.method !== "POST") return { ok: false, code: 404 };
  try {
    const body = await req.json();
    const { email, code } = await login.parseAsync(body);

    const userId =
      (await redis.get<string>(`code:${email}:${code}`)) ??
      raise("Invalid code");

    const token = await sign({ id: userId });

    await redis.del(`code:${email}:${code}`);

    return { ok: true, data: { token } };
  } catch (err) {
    return {
      ok: false,
      error: matchAndLog(err)
        .with(P.instanceOf(KnownError), (err) => err.message)
        .with(P.instanceOf(z.ZodError), (err) =>
          JSON.stringify(err.flatten().fieldErrors)
        )
        .otherwise(() => "Something went wrong"),
    };
  }
};

export default routerEdge(routeLogic);

export const config = {
  runtime: "edge",
  regions: ["pdx1"],
};

export type Response = RouteToResponse<typeof routeLogic>;
export type ResponseData = RouteToResponseData<typeof routeLogic>;
