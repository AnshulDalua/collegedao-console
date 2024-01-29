import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer";
import { P } from "ts-pattern";
import { z } from "zod";

import { projectWithCredentials } from "@/server/db/relations";
import { authMiddleware } from "@/server/middleware/auth";
import { router } from "@/server/middleware/router";
import Cache from "@/server/util/cache";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";
import raise from "@/utils/raise";

import type {
  AuthNextApiRequest,
  NextApiResponse,
} from "@/server/middleware/auth";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";
import type { GetCostAndUsageCommandOutput } from "@aws-sdk/client-cost-explorer";

const routeLogic = async (req: AuthNextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") return { ok: false, code: 404 };
  try {
    const projectId = req.query.projectId as string;
    const userId = req.middleware.id;
    const { start, end, noProjectFilter } = req.query as {
      start?: string;
      end?: string;
      noProjectFilter?: string;
    };

    if (!projectId) throw new KnownError("Missing Project ID");

    const project =
      (await projectWithCredentials(projectId, userId)) ??
      raise("This project does not exist or you do not have access to it.");

    const credentials = AWSCrendentials.safeParse(
      project.credentials?.contents ?? raise("Missing credentials")
    );
    if (!credentials.success) throw new KnownError("Invalid credentials");

    const cache = await Cache<GetCostAndUsageCommandOutput>(
      "aws-costs",
      userId,
      projectId,
      start,
      end,
      noProjectFilter
    );

    const cached = await cache.get();

    if (cached) {
      res.setHeader("X-ROCETTA-CACHE", "MISS");
      return { ok: true, data: cached };
    }

    const client = new CostExplorerClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: credentials.data.aws.AWS_ACCESS_KEY_ID,
        secretAccessKey: credentials.data.aws.AWS_SECRET_ACCESS_KEY,
      },
    });
    const date = new Date(),
      y = date.getFullYear(),
      m = date.getMonth();

    const command = new GetCostAndUsageCommand({
      TimePeriod: {
        Start: start ?? new Date(y - 1, m, 1).toISOString().slice(0, 10),
        End: end ?? new Date(y, m + 1, 0).toISOString().slice(0, 10),
      },
      Granularity: "MONTHLY",
      Filter: filterByProject(
        noProjectFilter === "true" ? undefined : projectId
      ),
      GroupBy: [
        {
          Type: "DIMENSION",
          Key: "SERVICE",
        },
      ],
      Metrics: [
        "AmortizedCost",
        "NetUnblendedCost",
        "UnblendedCost",
        "UsageQuantity",
      ],
    });
    const response = await client.send(command);

    res
      .setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate")
      .setHeader("X-ROCETTA-CACHE", "MISS");
    await cache.set(response, {
      ex: 86400,
    });

    return { ok: true, data: response };
  } catch (err) {
    return {
      ok: false,
      error: matchAndLog(err)
        .with(P.instanceOf(KnownError), (err) => err.message)
        .with(
          {
            message: P.string.includes(
              "User not enabled for cost explorer access"
            ),
          },
          () => "User's Cost Explorer is not enabled"
        )
        .otherwise(() => "Something went wrong"),
    };
  }
};

/** @HELPERFUNCTIONS */

export const AWSCrendentials = z.object({
  aws: z.object({
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
  }),
});

const filterByProject = (projectId?: string) =>
  projectId
    ? {
        And: [
          {
            Tags: {
              Key: "rocetta:managedBy",
              Values: ["rocetta"],
              MatchOptions: ["EQUALS"],
            },
          },
          {
            Tags: {
              Key: "rocetta:projectId",
              Values: [`${projectId}`],
              MatchOptions: ["EQUALS"],
            },
          },
        ],
      }
    : {
        Tags: {
          Key: "rocetta:managedBy",
          Values: ["rocetta"],
          MatchOptions: ["EQUALS"],
        },
      };

export default authMiddleware(router(routeLogic));

export type Response = RouteToResponse<typeof routeLogic>;
export type ResponseData = RouteToResponseData<typeof routeLogic>;
