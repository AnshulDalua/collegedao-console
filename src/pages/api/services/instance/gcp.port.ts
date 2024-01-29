import compute from "@google-cloud/compute";
import get from "lodash/get";
import { Pattern as P } from "ts-pattern";
import { z } from "zod";

import { getGCPCredentials } from "@/server/credentials/gcp";
import { getRunningStack } from "@/server/db/generics";
import { authMiddleware } from "@/server/middleware/auth";
import { router } from "@/server/middleware/router";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";
import check from "@/utils/paramsChecker";
import raise from "@/utils/raise";

import type {
  AuthNextApiRequest,
  NextApiResponse,
} from "@/server/middleware/auth";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";

const routeLogic = async (req: AuthNextApiRequest, _: NextApiResponse) => {
  if (req.method !== "POST" && req.method !== "GET" && req.method !== "DELETE")
    return { ok: false, code: 404 };
  try {
    const userId = req.middleware.id;
    const projectId = <string>req.query.projectId;
    const instanceId = <string>req.query.instanceId;
    let from = <number | undefined>parseInt(req.query.from as any);
    let to = <number | undefined>parseInt(req.query.to as any);
    const gcpFirewallId = <string | undefined>req.query.gcpFirewallId;

    check({ userId, instanceId, projectId });

    const instance = await getRunningStack("Instance", instanceId, userId);

    const instance_id =
      get(instance.output, "id.value") ??
      (raise("Instance does not have an instanceId") as string);

    const credentials = await getGCPCredentials(projectId, userId);
    const firewallClient = new compute.FirewallsClient({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
    });

    const [response] = await firewallClient.list({
      project: credentials.project_id,
      filter: "name != " + instance_id.split("/").pop(),
    });

    const firewalls = response
      .filter(
        (rules) =>
          !rules.disabled &&
          rules.sourceRanges?.includes("0.0.0.0/0") &&
          (rules.allowed?.length ?? 0) > 0 &&
          rules.allowed?.[0]?.IPProtocol !== "icmp"
      )
      .map((rules) => ({
        id: rules.id,
        ranges: rules.sourceRanges,
        from: rules.allowed?.map((allowed) => allowed.ports?.join(", ")).join(),
        to: rules.allowed?.map((allowed) => allowed.ports?.join(", ")).join(),
        protocol: rules.allowed?.map((allowed) => allowed.IPProtocol),
      }));

    // List all open ports for instance
    if (req.method === "GET") {
      return {
        ok: true,
        data: firewalls,
      };
    }

    from = z.number().positive().lte(65535).parse(from);
    to = z.number().positive().lte(65535).parse(to);

    if (req.method === "DELETE") {
      await firewallClient.delete({
        project: credentials.project_id,
        firewall: gcpFirewallId,
      });

      return {
        ok: true,
        data: {
          message: `Successfully closed ports from: ${from} to: ${to} for instance ${instanceId}`,
        },
      };
    }

    // POST RESPONSE - Add ingress rule to security group for ports
    await firewallClient.insert({
      project: credentials.project_id,
      firewallResource: {
        name: "allow-port-" + from,
        allowed: [
          {
            IPProtocol: "tcp",
            ports: [String(from)],
          },
        ],
        sourceRanges: ["0.0.0.0/0"],
      },
    });

    return {
      ok: true,
      data: {
        message: `Successfully opened ports from: ${from} to: ${to} for instance ${instanceId}`,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: matchAndLog(err)
        .with(P.instanceOf(KnownError), (err) => err.message)
        .with(P.instanceOf(z.ZodError), (err) => err.issues)
        .otherwise(() => "Something went wrong"),
    };
  }
};

export default authMiddleware(router(routeLogic));

export type Response = RouteToResponse<typeof routeLogic>;
export type ResponseData = RouteToResponseData<typeof routeLogic>;
