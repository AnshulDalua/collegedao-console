import type {
  AuthNextApiRequest,
  EdgeAuthNextApiRequest,
  NextApiResponse,
} from "./auth";
import type { NextResponse } from "next/server";

export function router(
  fn: (req: AuthNextApiRequest, res: NextApiResponse) => any
) {
  return async (req: AuthNextApiRequest, res: NextApiResponse) => {
    const returned = await fn(req, res);
    if (returned?.code) return res.status(returned.code).end();
    if (!returned?.ok) return res.status(400).json(returned);
    return res.status(200).json(returned);
  };
}

export function routerEdge(
  fn: (req: EdgeAuthNextApiRequest, res: NextResponse) => any
) {
  return async (
    req: EdgeAuthNextApiRequest,
    res: NextResponse
  ): Promise<unknown> => {
    const params = new URL(req.url).searchParams;
    req.query = new Proxy(
      {},
      { get: (_, prop) => params.get(prop.toString()) }
    );

    const returned = await fn(req, res);
    if (returned?.code)
      return new Response(null, {
        status: returned.code,
        headers: { "content-type": "application/json" },
      });
    if (!returned?.ok)
      return new Response(JSON.stringify(returned), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    return new Response(JSON.stringify(returned), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
}
