import { Pattern as P } from "ts-pattern";

import { generateTemporaryCredentials as getAWSCredentials } from "@/server/credentials/aws";
import { db } from "@/server/db";
import { stackWithCredentials } from "@/server/db/relations";
import { authMiddleware } from "@/server/middleware/auth";
import { router } from "@/server/middleware/router";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";
import raise from "@/utils/raise";

import type {
  AuthNextApiRequest,
  NextApiResponse,
} from "@/server/middleware/auth";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";

const routeLogic = async (req: AuthNextApiRequest, _: NextApiResponse) => {
  if (req.method !== "GET") return { ok: false, code: 404 };
  try {
    const stackId = <string>req.query.stackId ?? raise("stackId is required");
    const projectId =
      <string>req.query.projectId ?? raise("projectId is required");

    const stack =
      (await db
        .selectFrom("Stack")
        .select(["Stack.output", "Stack.input"])
        .select((eb) => [stackWithCredentials(eb)])
        .where("Stack.id", "=", stackId)
        .where("Stack.projectId", "=", projectId)
        .executeTakeFirst()) ?? raise("Stack not found");

    const tempCredentials = await getAWSCredentials(
      (stack.credentials ?? raise("Credentials not found")).contents as any,
      projectId
    );

    const region = (stack.input as any)?.enviromentConfig.region as string;

    return {
      ok: true,
      data: { credentials: tempCredentials, region },
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
