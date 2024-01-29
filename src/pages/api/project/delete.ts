import { Pattern as P } from "ts-pattern";

import { prisma } from "@/server/db/prisma";
import { authMiddleware } from "@/server/middleware/auth";
import { router } from "@/server/middleware/router";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";

import type {
  AuthNextApiRequest,
  NextApiResponse,
} from "@/server/middleware/auth";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";

const routeLogic = async (req: AuthNextApiRequest, _: NextApiResponse) => {
  if (req.method !== "DELETE") return { ok: false, code: 404 };
  try {
    const id = req.middleware.id;
    const teamId = <string>req.query.teamId;
    const projectId = <string>req.query.projectId;

    const stacks = await prisma.stack.count({
      where: {
        projectId,
        teamId: teamId,
        team: {
          users: {
            some: {
              userId: id,
            },
          },
        },
        NOT: [{ status: "DELETED" }, { status: "FAILED" }],
      },
    });

    if (stacks > 0) {
      throw new KnownError("Cannot delete project with active stacks");
    }

    const deletedStacks = await prisma.stack.deleteMany({
      where: {
        projectId,
        teamId: teamId,
        team: {
          users: {
            some: {
              userId: id,
            },
          },
        },
      },
    });
    const deleteCredentials = await prisma.credentials.deleteMany({
      where: { projectId },
    });
    const deletedProject = await prisma.project.delete({
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
    });

    return {
      ok: true,
      data: {
        stack: deletedStacks.count,
        credentials: deleteCredentials.count,
        project: deletedProject.id,
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
