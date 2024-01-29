import { Pattern as P } from "ts-pattern";

import { createGCPServiceAccount } from "@/server/credentials/gcp";
import { db } from "@/server/db";
import { authMiddleware } from "@/server/middleware/auth";
import { router } from "@/server/middleware/router";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";
import raise from "@/utils/raise";

import type { AuthNextApiRequest } from "@/server/middleware/auth";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";
import type { NextApiResponse } from "next";

const routeLogic = async (req: AuthNextApiRequest, _: NextApiResponse) => {
  if (req.method !== "POST") return { ok: false, code: 404 };
  try {
    const userId = req.middleware.id;
    const projectId = req.query.projectId as string;
    let gcpProject = <string | undefined>req.body.gcpProject;
    const createGCPProject = <"on" | "off">req.body.createAccount;

    (await db
      .selectFrom("Project")
      .select(["Project.name"])
      .innerJoin("UsersOnTeams", "UsersOnTeams.teamId", "Project.teamId")
      .where("Project.id", "=", projectId)
      .where("UsersOnTeams.userId", "=", userId)
      .executeTakeFirst()) ?? raise("Project not found");

    if (!gcpProject || createGCPProject === "on") {
      // TODO: Uncomment this when we have a way to create GCP projects
      // if (createGCPProject === "off") raise("No GCP project provided");
      // gcpProject = "projects/" + (await createGCPAccount(project.name, projectId));
      raise("No GCP project provided");
    }

    const serviceAccount = await createGCPServiceAccount(
      projectId,
      userId,
      gcpProject
    );

    return {
      ok: true,
      data: serviceAccount,
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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

export type Response = RouteToResponse<typeof routeLogic>;
export type ResponseData = RouteToResponseData<typeof routeLogic>;
