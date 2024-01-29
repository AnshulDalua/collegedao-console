import {
  CostExplorerClient,
  UpdateCostAllocationTagsStatusCommand,
} from "@aws-sdk/client-cost-explorer";
import {
  CreateGroupCommand,
  GetGroupCommand,
  ResourceGroupsClient,
} from "@aws-sdk/client-resource-groups";
import { P } from "ts-pattern";

import { projectWithCredentials } from "@/server/db/relations";
import { inngest, slugify } from "@/server/inngest";
import { authMiddleware } from "@/server/middleware/auth";
import { router } from "@/server/middleware/router";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";

import { AWSCrendentials } from "./index";

import type {
  AuthNextApiRequest,
  NextApiResponse,
} from "@/server/middleware/auth";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";

const USERNOTENABLED = "User not enabled for cost explorer access";

const routeLogic = async (req: AuthNextApiRequest, _: NextApiResponse) => {
  if (req.method !== "POST") return { ok: false, code: 404 };
  const projectId = req.query.projectId as string;
  const userId = req.middleware.id;

  return setupAWSBilling(userId, projectId);
};

export async function setupAWSBilling(
  userId: string,
  projectId: string,
  tries = 0
) {
  try {
    /** @Setup **/

    if (!projectId) throw new KnownError("Missing Project ID");

    const project = await projectWithCredentials(projectId, userId);
    if (!project)
      throw new KnownError(
        "This project does not exist or you do not have access to it."
      );

    const credentials = AWSCrendentials.safeParse(
      project.credentials?.contents
    );
    if (!credentials.success) throw new KnownError("Invalid credentials");

    const config = {
      region: "us-east-1",
      credentials: {
        accessKeyId: credentials.data.aws.AWS_ACCESS_KEY_ID,
        secretAccessKey: credentials.data.aws.AWS_SECRET_ACCESS_KEY,
      },
    } as const;

    /**
     * @BuildingBillingTrackingSystem
     * The idea is to create a resource group with the tag "rocetta:projectId" and "rocetta:managedBy" and then enable cost allocation tags for the group.
     * If there are no services without tags, then the cost allocation tags won't work.
     * Hence why we have to create a resource group with the those tags.
     **/
    const info = [];
    const tag = new CostExplorerClient(config);
    const resource = new ResourceGroupsClient(config);

    const resourceExists = await resource
      .send(
        new GetGroupCommand({
          Group: "rocetta_" + projectId,
        })
      )
      .catch(() => ({ Group: null }));

    if (!resourceExists.Group) {
      await resource
        .send(
          new CreateGroupCommand({
            Name: "rocetta_" + projectId,
            Description:
              "Rocetta Project Resource Group. This group is managed by Rocetta and shows all resources created by Rocetta.",
            ResourceQuery: {
              Type: "TAG_FILTERS_1_0",
              Query: JSON.stringify({
                ResourceTypeFilters: ["AWS::AllSupported"],
                TagFilters: [
                  { Key: "rocetta:projectId", Values: [`${projectId}`] },
                  { Key: "rocetta:managedBy", Values: ["rocetta"] },
                ],
              }),
            },
            Tags: {
              "rocetta:managedBy": "rocetta",
              "rocetta:projectId": projectId,
            },
          })
        )
        .then(() => info.push("RESOURCE_GROUP_CREATED"))
        .catch(() => info.push("RESOURCE_GROUP_FAILED"));
    } else info.push("RESOURCE_GROUP_ALREADY_EXISTS");
    await tag
      .send(
        new UpdateCostAllocationTagsStatusCommand({
          CostAllocationTagsStatus: [
            {
              Status: "Active",
              TagKey: "rocetta:managedBy",
            },
            {
              Status: "Active",
              TagKey: "rocetta:projectId",
            },
          ],
        })
      )
      .then((res) => {
        if (res.Errors?.length === 0)
          return info.push("COST_ALLOCATION_TAGS_READY");
        else return info.push("COST_ALLOCATION_TAGS_NOT_READY");
      })
      .catch((err) => {
        if (err instanceof Error && err.message.includes(USERNOTENABLED)) {
          return info.push("COST_EXPLORER_NOT_ENABLED");
        } else return info.push("COST_ALLOCATION_TAGS_NOT_READY");
      });

    // If the cost allocation tags are not ready, we try again in 1 day.
    if (info.includes("COST_ALLOCATION_TAGS_NOT_READY") && tries < 3) {
      await inngest.send({
        id: `console-billing-aws-setup-${projectId}`,
        name: "console/billing.aws.setup",
        data: { userId, projectId, run_in: "1 day", tries: tries + 1 },
        user: { external_id: userId },
      });
    }

    return { ok: true, data: info };
  } catch (error) {
    return {
      ok: false,
      error: matchAndLog(error)
        .with(P.instanceOf(KnownError), (err) => err.message)
        .otherwise(() => "Something went wrong"),
    };
  }
}

export const awsSetup = inngest.createFunction(
  { id: slugify("Notification"), name: "AWS Billing Setup" },
  { event: "console/billing.aws.setup" },
  async ({ event, step }) => {
    await step.sleep("wait-for-aws-billing", event.data?.run_in ?? 0);
    await step.run("AWS Billing Setup", async () => {
      return setupAWSBilling(
        event.data.userId,
        event.data.projectId,
        event.data?.tries ?? 0
      );
    });
  }
);

export default authMiddleware(router(routeLogic));

export type Response = RouteToResponse<typeof routeLogic>;
export type ResponseData = RouteToResponseData<typeof routeLogic>;
