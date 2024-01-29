import { google } from "googleapis";
import { Pattern as P } from "ts-pattern";
import { z } from "zod";

import { env } from "@/env.mjs";
import { createUser } from "@/server/auth/user";
import { db } from "@/server/db";
import { router } from "@/server/middleware/router";
import { sign } from "@/server/util/jwt";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";
import host from "@/utils/host";

import type {
  AuthNextApiRequest,
  NextApiResponse,
  RouteToResponse,
  RouteToResponseData,
} from "@/types/server";

const routeLogic = async (req: AuthNextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST" && req.method !== "PUT")
    return { ok: false, code: 404 };
  try {
    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_OAUTH_CLIENT_ID,
      env.GOOGLE_OAUTH_CLIENT_SECRET,
      host(req.headers.host!) + "/login"
    );

    // Generating the URL for the consent page
    if (req.method === "POST") {
      const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
          "https://www.googleapis.com/auth/userinfo.profile",
          "https://www.googleapis.com/auth/userinfo.email",
        ],
      });

      return { ok: true, data: { url } };
    }

    // Creating a new user or logging in an existing user
    if (req.method === "PUT") {
      const { code } = z.object({ code: z.string() }).parse(req.body);
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const { data } = await google
        .oauth2({ version: "v2", auth: oauth2Client })
        .userinfo.get();

      const { email, name } = data;
      if (!email || !name) throw new KnownError("Invalid email or name");

      const user =
        (await db
          .selectFrom("User")
          .select(["User.id", "name", "email", "createdAt", "updatedAt"])
          .where("email", "=", email)
          .executeTakeFirst()) ?? (await createUser({ name, email }));

      const token = await sign({ id: user.id });

      return { ok: true, data: { token } };
    }
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

export default router(routeLogic);

export type Response = RouteToResponse<typeof routeLogic>;
export type ResponseData = RouteToResponseData<typeof routeLogic>;
