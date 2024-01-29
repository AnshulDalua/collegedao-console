import merge from "lodash/merge";
import { Pattern as P } from "ts-pattern";

import { db } from "@/server/db";
import { withStack } from "@/server/db/relations";
import { inngest, inngestInfra } from "@/server/inngest";
import { authMiddleware } from "@/server/middleware/auth";
import { router } from "@/server/middleware/router";
import { matchAndLog } from "@/server/util/matchAndLog";
import { StackBuilderProps } from "@/types/infra/src/types/builder";
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
    const stackId =
      (req.query.stackId as string) ?? raise("stackId is required");
    let contents = <StackBuilderProps["inputs"]>req.body;
    const projectId =
      contents.rocettaConfig.projectId ?? raise("projectId is required");

    /** ------------ @AUTH ------------ */
    const project =
      (await db
        .selectFrom("Project")
        .selectAll()
        .select((eb) => withStack(eb, stackId))
        .innerJoin("UsersOnTeams", "UsersOnTeams.teamId", "Project.teamId")
        .where("Project.id", "=", projectId)
        .where("UsersOnTeams.userId", "=", userId)
        .executeTakeFirst()) ??
      raise("This project does not exist or you do not have access to it.");

    const stack = project.stack ?? raise("Stack not found");
    const oldName = (stack.input as any).name;
    contents = merge(stack.input, contents);

    /** ------------ @UPDATING ------------ */
    await db
      .updateTable("Stack")
      .set({
        id: stackId,
        status: "QUEUED" as const,
        name: contents.name,
        updatedAt: new Date(),
      })
      .where("Stack.id", "=", stackId)
      .execute();

    /*This is a hack to make sure the name is not changed in the stack which causes the stack to be destroyed and recreated with new name*/
    contents.name = oldName;

    const provider = stack.type.split("::")[0] as StackBuilderProps["provider"];
    const type = stack.type.split("::")[1] as StackBuilderProps["type"];

    const configs = [
      {
        key: `${provider}:region`,
        // Careful here, this is the region of the service which might destory the service
        value:
          contents.enviromentConfig?.region ??
          (stack?.input as any)?.enviromentConfig?.region ??
          raise("Region is required"),
      },
    ];
    await inngestInfra.send({
      name: "infra/stack.update",
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
          m: `Stack ${stack.name} has been queued for update`,
          s: "loading",
          v: false,
        },
        key: stack.type,
      },
      user: { external_id: userId },
    });

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
