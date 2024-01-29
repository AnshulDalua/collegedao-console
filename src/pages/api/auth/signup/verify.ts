import { Prisma } from "@prisma/client";
import { Pattern as P } from "ts-pattern";
import { z } from "zod";

import { createUser } from "@/server/auth/user";
import redis from "@/server/db/redis";
import { router } from "@/server/middleware/router";
import { sign } from "@/server/util/jwt";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";

import type { AuthNextApiRequest } from "@/server/middleware/auth";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";
import type { NextApiResponse } from "next";

const signup = z.object({
  code: z.string().max(6).min(6),
  email: z.string().email().max(255),
});

const routeLogic = async (req: AuthNextApiRequest, _: NextApiResponse) => {
  if (req.method !== "POST") return { ok: false, code: 404 };
  try {
    const { email, code } = await signup.parseAsync(req.body);

    const name = await redis.get(`code:${email}:${code}`);
    if (!name || typeof name !== "string") throw new KnownError("Invalid code");

    const user = await createUser({ name, email, code });
    const token = await sign({ id: user.id });

    return { ok: true, data: { user, token } };
  } catch (err) {
    return {
      ok: false,
      error: matchAndLog(err)
        .with(P.instanceOf(KnownError), (err) => err.message)
        .with(
          P.instanceOf(Prisma.PrismaClientKnownRequestError),
          { code: "P2002" },
          () => "Email already exists"
        )
        .with(P.instanceOf(z.ZodError), (err) =>
          JSON.stringify(err.flatten().fieldErrors)
        )
        .otherwise(() => "Something went wrong"),
    };
  }
};

export default router(routeLogic);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

export type Response = RouteToResponse<typeof routeLogic>;
export type ResponseData = RouteToResponseData<typeof routeLogic>;
