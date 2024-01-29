import { Pattern as P } from "ts-pattern";
import { z } from "zod";

import { updateCredentials } from "@/server/credentials";
import { router } from "@/server/middleware/router";
import Data from "@/server/util/data";
import { emit } from "@/server/util/emit";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";
import raise from "@/utils/raise";

import type { AuthNextApiRequest } from "@/server/middleware/auth";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";
import type { NextApiResponse } from "next";

export const handshakeBody = z.object({
  handshakeKey: z.string(),
  accessKey: z.string(),
  secretKey: z.string(),
});

export const handshakeInfo = z.object({
  handshakeId: z.string(),
  userId: z.string(),
  projectId: z.string(),
  createdAt: z.number(),
});

const routeLogic = async (req: AuthNextApiRequest, _: NextApiResponse) => {
  if (req.method !== "POST") return { ok: false, code: 404 };
  try {
    const { handshakeKey, accessKey, secretKey } = handshakeBody.parse(
      req.body
    );

    const handshakeHandler = new Data<z.infer<typeof handshakeInfo>>(
      "aws",
      "handshake",
      handshakeKey
    ).addZod(handshakeInfo);

    const handshake =
      (await handshakeHandler.get()) ?? raise("Handshake not found");

    const { projectId, userId } = handshake;
    const awsCredentials = {
      aws: {
        AWS_ACCESS_KEY_ID: accessKey,
        AWS_SECRET_ACCESS_KEY: secretKey,
      },
    };

    await updateCredentials(projectId, userId, awsCredentials);
    await emit(handshake.projectId, "aws_handshake_completed");
    await handshakeHandler.delete();

    return { ok: true, data: {} };
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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

export type Response = RouteToResponse<typeof routeLogic>;
export type ResponseData = RouteToResponseData<typeof routeLogic>;
