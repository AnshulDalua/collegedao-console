import { aws, gcp } from "@/types/config";

import type { JsonObject, JsonValue } from "kysely-codegen";

type ProjectWithCredentials = {
  [key: string]: any;
  credentials: {
    contents: JsonValue;
  } | null;
};

export function credentialsSafe(
  project: ProjectWithCredentials | ProjectWithCredentials[]
) {
  const projects = Array.isArray(project) ? project : [project];

  for (const project of projects) {
    if (!project.credentials) continue;
    const contents = project.credentials.contents as JsonObject;
    if (contents.aws) contents.aws = aws.safeParse(contents.aws).success;
    if (contents.gcp) contents.gcp = gcp.safeParse(contents.gcp).success;
  }
}
