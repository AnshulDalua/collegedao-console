import { Pattern as P } from "ts-pattern";
import { z } from "zod";

import { handshakeInfo } from "@/pages/api/project/credentials/aws/handshake";
import { authMiddleware } from "@/server/middleware/auth";
import { router } from "@/server/middleware/router";
import Data from "@/server/util/data";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";
import host from "@/utils/host";
import { rhoIdGenerator } from "@/utils/id";

import type { AuthNextApiRequest } from "@/server/middleware/auth";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";
import type { NextApiResponse } from "next";

const routeLogic = async (req: AuthNextApiRequest, _: NextApiResponse) => {
  if (req.method !== "POST") return { ok: false, code: 404 };
  try {
    const projectId = req.query.projectId as string;
    const userId = req.middleware.id;
    const handshakeId = rhoIdGenerator();
    const handshakeKey = rhoIdGenerator();

    const handshakeHandler = new Data<z.infer<typeof handshakeInfo>>(
      "aws",
      "handshake",
      handshakeKey
    ).addZod(handshakeInfo);

    await handshakeHandler.set(
      {
        projectId,
        userId,
        handshakeId,
        createdAt: new Date().getTime(),
      },
      { ex: 60 * 60 }
    );

    const handshakeUrl =
      host(req.headers.host!) + `/api/project/credentials/aws/handshake`;
    const templateURL = `https://rocetta-public.s3.us-west-2.amazonaws.com/rocetta-integration-latest.yaml`;
    const stackName = `ConnectToRocetta-` + handshakeId;
    const RocettaIAMUsername = `rocetta-` + handshakeId;

    const URL = `https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=${templateURL}&stackName=${stackName}&param_RocettaIAMUsername=${RocettaIAMUsername}&param_RocettaEndpoint=${handshakeUrl}&param_RocettaHandshakeKey=${handshakeKey}`;

    return {
      ok: true,
      data: {
        handshakeId: handshakeId,
        url: URL,
      },
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
