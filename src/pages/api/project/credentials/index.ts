import { Pattern as P } from "ts-pattern";

import { updateCredentials } from "@/server/credentials";
import { authMiddleware } from "@/server/middleware/auth";
import { router } from "@/server/middleware/router";
import { matchAndLog } from "@/server/util/matchAndLog";
import { CloudCredentials } from "@/types/config";
import { KnownError } from "@/utils/error";
import raise from "@/utils/raise";

import type {
  AuthNextApiRequest,
  NextApiResponse,
} from "@/server/middleware/auth";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";

const routeLogic = async (req: AuthNextApiRequest, _: NextApiResponse) => {
  if (req.method !== "POST") return { ok: false, code: 404 };
  try {
    const userId = req.middleware.id;
    const projectId =
      <string>req.query.projectId ?? raise("projectId is required");
    const projectCredentials = CloudCredentials.safeParse(req.body);

    if (!projectCredentials.success || !projectCredentials.data)
      throw new KnownError("Invalid credentials");

    await updateCredentials(projectId, userId, projectCredentials.data);

    return {
      ok: true,
      data: {},
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

export default authMiddleware(router(routeLogic));

export type Response = RouteToResponse<typeof routeLogic>;
export type ResponseData = RouteToResponseData<typeof routeLogic>;
