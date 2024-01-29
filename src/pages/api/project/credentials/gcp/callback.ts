import { google } from "googleapis";
import { Pattern as P } from "ts-pattern";
import { z } from "zod";

import { env } from "@/env.mjs";
import { authMiddleware } from "@/server/middleware/auth";
import { router } from "@/server/middleware/router";
import Data from "@/server/util/data";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";
import host from "@/utils/host";
import raise from "@/utils/raise";

import type { AuthNextApiRequest } from "@/server/middleware/auth";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";
import type { NextApiResponse } from "next";

export const GCPOAuth = z.object({
  oauth: z.object({
    refresh_token: z.string(),
    access_token: z.string(),
  }),
});

const cloudresourcemanager = google.cloudresourcemanager("v3");

const routeLogic = async (req: AuthNextApiRequest, _: NextApiResponse) => {
  if (req.method !== "POST") return { ok: false, code: 404 };
  try {
    const code = (req.body.code as string) ?? raise("No code provided");
    const projectId = req.query.projectId as string;

    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_OAUTH_CLIENT_ID,
      env.GOOGLE_OAUTH_CLIENT_SECRET,
      host(req.headers.host!) + "/app/onboarding"
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const { data: resProjects } = await cloudresourcemanager.projects.search({
      auth: oauth2Client,
    });

    const oauthHandler = new Data<z.infer<typeof GCPOAuth>>(
      "gcp",
      "oauth",
      projectId
    ).addZod(GCPOAuth);

    await oauthHandler.set(
      {
        oauth: {
          refresh_token: tokens.refresh_token ?? "",
          access_token: tokens.access_token ?? "",
        },
      },
      { ex: 60 * 60 }
    );

    const projects = resProjects.projects
      ?.map((p) => ({
        name: p.displayName!,
        id: p.projectId!,
      }))
      .filter(Boolean)!;

    return {
      ok: true,
      data: { projects },
    };
  } catch (err) {
    return {
      ok: false,
      error: matchAndLog(err)
        .with(P.instanceOf(KnownError), (err) => err.message)
        .with(P.instanceOf(z.ZodError), (err) =>
          JSON.stringify(err.flatten().fieldErrors)
        )
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
