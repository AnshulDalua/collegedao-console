import { Prisma } from "@prisma/client";
import { Pattern as P } from "ts-pattern";
import { z } from "zod";

import { prisma } from "@/server/db/prisma";
import { router } from "@/server/middleware/router";
import { matchAndLog } from "@/server/util/matchAndLog";
import { sendCode } from "@/server/util/send_code";
import { KnownError } from "@/utils/error";

import type { AuthNextApiRequest } from "@/server/middleware/auth";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";
import type { NextApiResponse } from "next";

const signup = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  resend: z.boolean().optional(),
});

const routeLogic = async (req: AuthNextApiRequest, _: NextApiResponse) => {
  if (req.method !== "POST") return { ok: false, code: 404 };
  try {
    const { name, email, resend } = await signup.parseAsync(req.body);

    if (!resend) {
      const userExists = await prisma.user.findUnique({
        where: { email },
      });
      if (userExists) throw new KnownError("Email already exists");
    }

    const codeRes = await sendCode(email, name);

    return {
      ok: true,
      data: {
        code: codeRes,
      },
    };
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
