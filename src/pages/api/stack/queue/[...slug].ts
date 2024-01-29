import { Pattern as P } from "ts-pattern";

import { db } from "@/server/db";
import { inngest, inngestInfra } from "@/server/inngest";
import { authMiddleware } from "@/server/middleware/auth";
import { router } from "@/server/middleware/router";
import { emit } from "@/server/util/emit";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";
import { rhoIdGenerator } from "@/utils/id";
import check from "@/utils/paramsChecker";
import raise from "@/utils/raise";

import type {
  AuthNextApiRequest,
  NextApiResponse,
} from "@/server/middleware/auth";
import type { StackBuilderProps } from "@/types/infra/src/types/builder";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";

const routeLogic = async (req: AuthNextApiRequest, _: NextApiResponse) => {
  if (req.method !== "POST") return { ok: false, code: 404 };
  try {
    const userId = req.middleware.id;
    const teamId = <string>req.query.teamId ?? raise("TeamId not found");
    const { slug } = req.query as { slug: string[] };
    const provider = <string>slug.at(0);
    const type = <string>slug.at(1);
    const contents = <StackBuilderProps["inputs"]>req.body;

    check({
      provider,
      type,
      environment: contents.enviromentConfig,
      region: contents.enviromentConfig.region,
      projectId: contents.rocettaConfig.projectId,
    });

    const configs = [
      {
        key: `${provider}:region`,
        value: contents.enviromentConfig.region,
      },
    ];

    const projectId = contents.rocettaConfig.projectId;
    check({ projectId });

    /** ------------ @AUTH ------------ */
    (await db
      .selectFrom("Project")
      .select(["id"])
      .innerJoin("UsersOnTeams", "UsersOnTeams.teamId", "Project.teamId")
      .where("Project.id", "=", projectId)
      .where("UsersOnTeams.userId", "=", userId)
      .where("UsersOnTeams.teamId", "=", teamId)
      .executeTakeFirst()) ??
      raise("This project does not exist or you do not have access to it.");

    /** ------------ @PROVISIONING ------------ */
    const stackId = rhoIdGenerator();
    await db
      .insertInto("Stack")
      .values({
        id: stackId,
        status: "QUEUED" as const,
        name: contents.name,
        type: `${provider}::${type}`,
        input: JSON.stringify(contents),
        error: "[]",
        output: "{}",
        teamId: teamId,
        projectId: projectId,
        updatedAt: new Date(),
      })
      .executeTakeFirst();

    await inngestInfra.send({
      id: `stack-create-${stackId}`,
      name: "infra/stack.create",
      data: {
        type: type,
        provider: provider,
        inputs: contents,
        stackId: stackId,
        projectId: projectId,
        userId: userId,
        configs: configs,
        program: "" as any,
        rocettaConfig: contents.rocettaConfig,
      },
      user: { external_id: userId },
    });

    await inngest.send({
      name: "console/notifications",
      data: {
        projectId: projectId,
        notification: {
          t: new Date(),
          m: `Stack ${contents.name} has been queued for deployment`,
          s: "loading",
          v: false,
        },
        key: type,
      },
      user: { external_id: userId },
    });

    await emit(projectId, ["notifications", type]);

    return {
      ok: true,
      data: {
        message: "Service has been queued.",
        id: stackId,
      },
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
