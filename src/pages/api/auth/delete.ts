import { Pattern as P } from "ts-pattern";
import { z } from "zod";

import { deleteUser } from "@/server/auth/user";
import { authMiddleware } from "@/server/middleware/auth";
import { router } from "@/server/middleware/router";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";

import type {
  AuthNextApiRequest,
  NextApiResponse,
  RouteToResponse,
  RouteToResponseData,
} from "@/types/server";

const routeLogic = async (req: AuthNextApiRequest, _: NextApiResponse) => {
  if (req.method !== "DELETE") return { ok: false, code: 404 };
  try {
    const id = req.middleware.id;

    const { user, teams } = await deleteUser(id);

    return {
      ok: true,
      data: {
        user,
        teams,
      },
    };
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

export default authMiddleware(router(routeLogic));

export type Response = RouteToResponse<typeof routeLogic>;
export type ResponseData = RouteToResponseData<typeof routeLogic>;
