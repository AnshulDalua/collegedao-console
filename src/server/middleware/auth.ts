import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

import { verify } from "../util/jwt";
import { JSONResponse } from "../util/response";

const NOTPROVIDED = { ok: false, error: "Authorization is not provided" };
const NOTPROVIDEDTOKEN = { ok: false, error: "Token is not provided" };
const NOTVERIFIED = { ok: false, error: "Token could not be verified" };

/** @FUNCTIONS */
export interface AuthNextApiRequest extends NextApiRequest {
  middleware: {
    /** This is the userId */
    id: string;
  };
}

export type { NextApiResponse } from "next";

export type AuthNextApiHandler<T = any> = (
  req: AuthNextApiRequest,
  res: NextApiResponse<T>
) => unknown | Promise<unknown>;

export function authMiddleware(handler: AuthNextApiHandler) {
  return async (req: AuthNextApiRequest, res: NextApiResponse) => {
    const { authorization } = req.headers;
    if (!authorization) return res.status(401).json(NOTPROVIDED);

    const token = authorization.split(" ")[1];
    if (!token) return res.status(401).json(NOTPROVIDEDTOKEN);

    const user = await verify(token);
    if ("error" in user) return res.status(401).json(NOTVERIFIED);

    req.middleware = {
      id: user.id,
    };

    if (req.method === "GET") {
      res.setHeader(
        "Cache-Control",
        "private, s-maxage=120, stale-while-revalidate"
      );
    }

    return handler(req, res);
  };
}

/** @EDGE */
// --------------------------------------------------------

export interface EdgeAuthNextApiRequest extends NextRequest {
  query: {
    [key: string]: string | string[] | undefined;
  };
  middleware: {
    id: string;
  };
}

export type EdgeNextApiHandler = (
  req: EdgeAuthNextApiRequest,
  res: NextResponse
) => unknown | Promise<unknown>;

export function authMiddlewareEdge(handler: EdgeNextApiHandler) {
  return async (req: EdgeAuthNextApiRequest, res: NextResponse) => {
    const authorization = req.headers.get("authorization");
    if (!authorization) return JSONResponse(NOTPROVIDED, { status: 401 });

    const token = authorization.split(" ")[1];
    if (!token) return JSONResponse(NOTPROVIDEDTOKEN, { status: 401 });

    const user = await verify(token);
    if ("error" in user) return JSONResponse(NOTVERIFIED, { status: 401 });

    if (req.method === "GET") {
      const response = NextResponse.next();
      response.headers.append(
        "Cache-Control",
        "private, s-maxage=120, stale-while-revalidate"
      );
    }

    req.middleware = {
      id: user.id,
    };

    return handler(req, res);
  };
}
