import {
  DescribeDBInstanceAutomatedBackupsCommand,
  RDSClient,
} from "@aws-sdk/client-rds";
import { jsonObjectFrom } from "kysely/helpers/mysql";
import get from "lodash/get";
import { z } from "zod";

import { db } from "@/server/db";
import { authMiddleware } from "@/server/middleware/auth";
import { router } from "@/server/middleware/router";
import Cache from "@/server/util/cache";
import { KnownError } from "@/utils/error";

import type {
  AuthNextApiRequest,
  NextApiResponse,
} from "@/server/middleware/auth";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";
import type { DescribeDBClusterAutomatedBackupsCommandOutput } from "@aws-sdk/client-rds";

const routeLogic = async (req: AuthNextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") return { ok: false, code: 404 };
  try {
    const stackId = req.query.databaseId as string;
    const userId = req.middleware.id;

    if (!stackId) throw new KnownError("Missing Stack ID");

    const stack = await db
      .selectFrom("Stack")
      .select(["Stack.id", "output", "input"])
      .select((eb) =>
        jsonObjectFrom(
          eb
            .selectFrom("Credentials")
            .select(["Credentials.id", "contents", "projectId"])
            .whereRef("Credentials.projectId", "=", "Stack.projectId")
        ).as("credentials")
      )
      .where("Stack.id", "=", stackId)
      .executeTakeFirst();

    if (!stack)
      throw new KnownError(
        "This stack does not exist or you do not have access to it."
      );

    if (!stack.credentials?.contents)
      throw new KnownError("Missing credentials");

    const credentials = AWSCrendentials.safeParse(stack.credentials?.contents);
    if (!credentials.success) throw new KnownError("Invalid credentials");

    const cache = await Cache<DescribeDBClusterAutomatedBackupsCommandOutput>(
      "aws-rds-info",
      userId,
      stackId
    );

    const cached = await cache.get();
    res.setHeader("X-ROCETTA-CACHE", "true");
    if (cached) return { ok: true, data: cached };

    const client = new RDSClient({
      region: get(stack.input, "region"),
      credentials: {
        accessKeyId: credentials.data.aws.AWS_ACCESS_KEY_ID,
        secretAccessKey: credentials.data.aws.AWS_SECRET_ACCESS_KEY,
      },
    });

    const response = await client.send(
      new DescribeDBInstanceAutomatedBackupsCommand({
        DBInstanceIdentifier: get(stack.output, "id.value"),
      })
    );

    res
      .setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate")
      .setHeader("X-ROCETTA-CACHE", "false");
    await cache.set(response, {
      ex: 86400,
    });

    return { ok: true, data: response };
  } catch (error) {
    let errorMsg: string = "Internal Server Error";
    if (error instanceof KnownError) errorMsg = error.message;

    return { ok: false, error: errorMsg };
  }
};

/** @HELPERFUNCTIONS */

export const AWSCrendentials = z.object({
  aws: z.object({
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
  }),
});

export default authMiddleware(router(routeLogic));

export type Response = RouteToResponse<typeof routeLogic>;
export type ResponseData = RouteToResponseData<typeof routeLogic>;
