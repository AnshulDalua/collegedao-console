import { Pattern as P } from "ts-pattern";

import { prisma } from "@/server/db/prisma";
import { inngest } from "@/server/inngest";
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
  if (req.method !== "POST") return { ok: false, code: 404 };
  try {
    const id = req.middleware.id;
    const teamId = <string>req.query.teamId;
    const projectId = <string>req.query.projectId;
    const projectDetails = req.body;

    check({ projectId, name: projectDetails.name });

    const project = await prisma.project.update({
      where: {
        id: projectId,
        teamId: teamId,
        team: {
          users: {
            some: {
              userId: id,
            },
          },
        },
      },
      data: {
        name: projectDetails.name,
      },
    });

    const user = await prisma.user.findFirst({
      select: { name: true },
      where: { id },
    });

    await inngest.send({
      name: "console/notifications",
      data: {
        projectId: projectId,
        notification: {
          t: new Date(),
          m: `Project has been updated ${user && `by ${user.name}`}.`,
          s: "loading",
          v: false,
        },
      },
      user: { external_id: id },
    });

    return {
      ok: true,
      data: project,
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
