import { match, Pattern as P } from "ts-pattern";

import { db } from "@/server/db";
import { authMiddleware } from "@/server/middleware/auth";
import { router } from "@/server/middleware/router";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";
import check from "@/utils/paramsChecker";

import type {
  AuthNextApiRequest,
  NextApiResponse,
} from "@/server/middleware/auth";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";

const routeLogic = async (req: AuthNextApiRequest, _: NextApiResponse) => {
  if (req.method !== "GET") return { ok: false, code: 404 };
  try {
    const id = req.middleware.id;
    const instanceId = <string>req.query.instanceId;
    const gcp_email = <string | undefined>req.query.gcp_email;

    check({ id, instanceId });

    const instance = await db
      .selectFrom("Stack")
      .select(["Stack.id", "type", "status", "output", "input"])
      .innerJoin("UsersOnTeams", "UsersOnTeams.teamId", "Stack.teamId")
      .where("Stack.id", "=", instanceId)
      .where("UsersOnTeams.userId", "=", id)
      .executeTakeFirst();

    if (!instance) throw new KnownError("Instance not found");
    if (instance.status === "PENDING") throw new KnownError("Instance pending");
    if (instance.status !== "RUNNING")
      throw new KnownError("Instance is not running");
    if (!(<any>instance.output)?.id?.value)
      throw new KnownError("Instance does not have an instanceId");

    const instance_id = (<any>instance.output).id.value;
    const region = (<any>instance.input).enviromentConfig.region;
    if (!region) throw new KnownError("Instance does not have a region");
    if (!instance_id)
      throw new KnownError("Instance does not have an instanceId");

    const url = await match(instance.type.split(":")[0])
      .with("aws", () => {
        return `https://${region}.console.aws.amazon.com/ec2-instance-connect/ssh?connType=standard&instanceId=${instance_id}&osUser=root&region=${region}&sshPort=22#`;
      })
      .with("gcp", () => {
        /* instance_id looks like this: projects/PROJECT_ID/zones/REGION/instances/INSTANCE_ID */
        const [_, $projectId, _2, $region, _3, $instanceId] =
          instance_id.split("/");

        return `https://console.cloud.google.com/compute/instancesDetail/zones/${$region}/instances/${$instanceId}?project=${$projectId}&authuser=${
          gcp_email ?? 4
        }`;
      })
      .otherwise(() => {
        throw new KnownError("Instance type not supported");
      });

    return {
      ok: true,
      data: { url },
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
