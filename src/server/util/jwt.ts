import { jwtVerify, SignJWT } from "jose";

import { env } from "@/env.mjs";

import type { JWTPayload } from "jose";

interface Token {
  id: string;
}

export async function sign(payload: Token) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * 7 * 4; // 4 weeks

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(new TextEncoder().encode(env.JWT_SECRET));
}

const invalid = {
  error: "Invalid token",
};

export async function verify(token: string) {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(env.JWT_SECRET)
    );
    if ("id" in payload) return payload as JWTPayload & Token;
    else return invalid;
  } catch (err) {
    return invalid;
  }
}
