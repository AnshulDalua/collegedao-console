import { Pattern as P } from "ts-pattern";
import { z } from "zod";

import { db } from "@/server/db";
import { routerEdge } from "@/server/middleware/router";
import { matchAndLog } from "@/server/util/matchAndLog";
import { sendCode } from "@/server/util/send_code";
import { KnownError } from "@/utils/error";

import type {
  EdgeAuthNextApiRequest,
  NextResponse,
  RouteToResponse,
  RouteToResponseData,
} from "@/types/server";

const login = z.object({
  email: z.string().email().max(255),
  keepAlive: z.boolean().optional(),
});

const routeLogic = async (req: EdgeAuthNextApiRequest, res: NextResponse) => {
  if (req.method !== "POST") return { ok: false, code: 404 };
  try {
    const body = await req.json()
    const { email } = await login.parseAsync(body);

    const user = await db
      .selectFrom("User")
      .select(["User.id", "email"])
      .where("email", "=", email)
      .executeTakeFirst();
    if (!user) throw new KnownError("User not found");

    const codeRes = await sendCode(user.email, user.id);

    return { ok: true, data: { code: codeRes, id: user.id } };
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
