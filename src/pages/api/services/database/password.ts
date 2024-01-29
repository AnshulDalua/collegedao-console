import { Pattern as P } from "ts-pattern";
import { NextResponse } from "next/server";

import { getRunningStack } from "@/server/db/generics";
import { authMiddlewareEdge } from "@/server/middleware/auth";
import { routerEdge } from "@/server/middleware/router";
import { matchAndLog } from "@/server/util/matchAndLog";
import { KnownError } from "@/utils/error";
import check from "@/utils/paramsChecker";

import type { EdgeAuthNextApiRequest } from "@/server/middleware/auth";
import type { RouteToResponse, RouteToResponseData } from "@/types/server";

const routeLogic = async (req: EdgeAuthNextApiRequest, _: NextResponse) => {
  if (req.method !== "GET") return { ok: false, code: 404 };
  try {
    const userId = req.middleware.id;
    const databaseId = <string>req.query.databaseId;
    const database = await getRunningStack("Database", databaseId, userId);

    const output = database.output as any;
    const input = database.input as any;
    const name = output.name.value as string;
    const user = output.user.value as string;
    const password = output.password.value as string;
    const endpoint = output.endpoint.value as string;
    const port = output.port.value as string;

    // Determine what type of database it is
    let type = (input?.engine ?? input?.image).toLowerCase();
    if (type.includes("postgres")) type = "postgres";
    else if (type.includes("mysql")) type = "mysql";
    else throw new KnownError("Unable to determine database type");

    check({ name, user, password, endpoint, port });
    return {
      ok: true,
      data: {
        status: "success" as const,
        url: `${type}://${user}:${password}@${endpoint}/${name}`,
        login: {
          type,
          name,
          user,
          password,
          endpoint,
          port,
        },
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

export default authMiddlewareEdge(routerEdge(routeLogic));

export const config = {
  runtime: "edge",
  regions: ["pdx1"],
};

export type Response = RouteToResponse<typeof routeLogic>;
export type ResponseData = RouteToResponseData<typeof routeLogic>;
