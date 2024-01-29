import { env } from "@/env.mjs";
import { sign } from "@/server/util/jwt";

/* Realtime Emit Function to provide realtime feedback to user */

const REALTIME_SERVER =
  env.NEXT_PUBLIC_REALTIME_URL.replace("ws://", "http://").replace(
    "wss://",
    "https://"
  ) + "/ping";

export const emit = async (
  room: string,
  content: string | string[] | object
) => {
  try {
    const token = await sign({ id: "server" });
    await fetch(REALTIME_SERVER, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ room, content }),
    });
  } catch (err) {}
};
