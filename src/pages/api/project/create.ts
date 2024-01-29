import { Pattern as P } from "ts-pattern";

import { prisma } from "@/server/db/prisma";
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
    const teamId = <string>req.query.teamId;
    const projectDetails = req.body;

    check({ teamId, name: projectDetails.name });

    // Check if the name is already taken
    const projectWithSameName = await prisma.project.findFirst({
      where: {
        name: projectDetails.name,
        team: {
          id: teamId,
        },
      },
    });

    if (projectWithSameName)
      throw new KnownError("A project with the same name already exists");

    const project = await prisma.project.create({
      data: {
        name: projectDetails.name,
        team: { connect: { id: teamId } },
        Credentials: {
          create: {
            contents: {},
          },
        },
      },
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
