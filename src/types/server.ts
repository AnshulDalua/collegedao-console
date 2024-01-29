import { NextResponse } from "next/server";

import {
  AuthNextApiRequest,
  EdgeAuthNextApiRequest,
  NextApiResponse,
} from "@/server/middleware/auth";

export type EdgeAPIRoute = (
  req: EdgeAuthNextApiRequest,
  res: NextResponse
) => Promise<any>;

export type APIRoute = (
  req: AuthNextApiRequest,
  res: NextApiResponse
) => Promise<any>;

export type RouteToResponse<T extends (...args: any) => any> =
  | {
      ok: true;
      data: NonNullable<Awaited<ReturnType<T>>["data"]>;
    }
  | {
      ok: false;
      error: NonNullable<Awaited<ReturnType<T>>["error"]>;
    };

export type RouteToResponseData<T extends (...args: any) => any> = NonNullable<
  Awaited<ReturnType<T>>["data"]
>;

export type {
  AuthNextApiRequest,
  EdgeAuthNextApiRequest,
  NextApiResponse,
} from "@/server/middleware/auth";

export type { NextResponse } from "next/server";
