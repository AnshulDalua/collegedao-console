import { Inngest } from "inngest";

import { env } from "@/env.mjs";

export { slugify } from "inngest";

export const inngestInfra = new Inngest({
  id: "infra",
  name: "infra",
});

export const inngest = new Inngest({
  id: "console",
  name: "console",
});

if (env.INNGEST_EVENT_KEY) {
  console.info("Inngest event key found, enabling Inngest");
  inngestInfra.setEventKey(env.INNGEST_EVENT_KEY);
  inngest.setEventKey(env.INNGEST_EVENT_KEY);
}