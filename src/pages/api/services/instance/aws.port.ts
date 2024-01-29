import {
  AuthorizeSecurityGroupIngressCommand,
  DescribeInstancesCommand,
  DescribeSecurityGroupsCommand,
  EC2Client,
  RevokeSecurityGroupIngressCommand,
} from "@aws-sdk/client-ec2";
import get from "lodash/get";
import { Pattern as P } from "ts-pattern";
import { z } from "zod";

import { getAWSCredentials } from "@/server/credentials/aws";
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

    check({ userId, instanceId, projectId });

    const instance = await getRunningStack("Instance", instanceId, userId);

    const instance_id =
      get(instance.output, "id.value") ??
      raise("Instance does not have an instanceId");
    const region =
      get(instance.input, "enviromentConfig.region") ??
      raise("Instance does not have a region");

    const credentials = await getAWSCredentials(projectId, userId);
    const client = new EC2Client({
      region: region,
      credentials: {
        accessKeyId: credentials.AWS_ACCESS_KEY_ID,
        secretAccessKey: credentials.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Grab security group of instance
    const securityGroups = await client
      .send(new DescribeInstancesCommand({ InstanceIds: [instance_id] }))
      .then((res) => res.Reservations?.[0]?.Instances?.[0]?.SecurityGroups)
      .catch(() => raise("Failed to get security group of instance"));

    if (!securityGroups) raise("Failed to get security group of instance");

    /* GET RESPONSE - Grab all ingress rules of security group */
    if (req.method === "GET") {
      const securityGroupId =
        securityGroups[0]?.GroupId ??
        raise("Failed to get security group of instance");

      const ingressRules = await client
        .send(
          new DescribeSecurityGroupsCommand({ GroupIds: [securityGroupId] })
        )
        .then((res) => res.SecurityGroups?.[0]?.IpPermissions)
        .catch(() => raise("Failed to get ingress rules of security group"));

      return {
        ok: true,
        data: ingressRules?.map(
          ({ IpProtocol, FromPort, ToPort, IpRanges }) => ({
            id: 0,
            protocol: IpProtocol,
            from: FromPort,
            to: ToPort,
            ranges: IpRanges?.map(({ CidrIp }) => CidrIp),
          })
        ),
      };
    }

    from = z.number().positive().lte(65535).parse(from);
    to = z.number().positive().lte(65535).parse(to);

    // DELETE RESPONSE - Remove ingress rule from security group for ports
    if (req.method === "DELETE") {
      await client.send(
        new RevokeSecurityGroupIngressCommand({
          GroupId: securityGroups[0]?.GroupId,
          IpProtocol: "tcp",
          FromPort: from,
          ToPort: to,
          CidrIp: "0.0.0.0/0",
        })
      );

      return {
        ok: true,
        data: {
          message: `Successfully closed ports from: ${from} to: ${to} for instance ${instanceId}`,
        },
      };
    }

    // POST RESPONSE - Add ingress rule to security group for ports
    await client
      .send(
        new AuthorizeSecurityGroupIngressCommand({
          GroupId: securityGroups[0]?.GroupId,
          IpPermissions: [
            {
              /* Allow all traffic from all IPs & Protocols to Port*/
              IpProtocol: "tcp",
              FromPort: from,
              ToPort: to,
              IpRanges: [{ CidrIp: "0.0.0.0/0" }],
            },
          ],
        })
      )
      .catch((e) => {
        if (e.name === "InvalidPermission.Duplicate")
          raise("Port already open");
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
