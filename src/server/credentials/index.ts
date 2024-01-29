import merge from "lodash/merge";
import { z } from "zod";

import { setupAWSBilling } from "@/pages/api/project/billing/aws/setup";
import { checkAWSCredentials } from "@/server/credentials/aws";
import {
  checkGCPCredentials,
  setupGCPServices,
} from "@/server/credentials/gcp";
import { getOrCreateCredentials } from "@/server/db/commands";
import { prisma } from "@/server/db/prisma";
import { inngest } from "@/server/inngest";
import { CloudCredentials } from "@/types/config";

export async function updateCredentials(
  projectId: string,
  userId: string,
  projectCredentials: z.infer<typeof CloudCredentials>
) {
  if (!projectCredentials) return;

  /* Grab existing credentials */
  const prevCredentials = await getOrCreateCredentials(projectId, userId);

  /* Verify credentials */
  /* This will throw an KnownError if the credentials are invalid */
  if (projectCredentials.aws) {
    await checkAWSCredentials({ aws: projectCredentials.aws }, projectId);
  }

  if (projectCredentials.gcp) {
    await checkGCPCredentials({ gcp: projectCredentials.gcp }, projectId);
  }

  /* Update credentials */
  await prisma.credentials.update({
    where: { id: prevCredentials.id },
    data: {
      contents: merge(prevCredentials?.contents, projectCredentials),
    },
  });

  /* Setup GCP */
  if (projectCredentials.gcp) {
    await setupGCPServices(projectId, userId);
  }

  /* Setup AWS */
  if (projectCredentials.aws) {
    await setupAWSBilling(userId, projectId);
  }

  /* Send notification */
  const user = await prisma.user.findFirst({
    where: { id: userId },
    select: { name: true },
  });

  await inngest.send({
    name: "console/notifications",
    data: {
      projectId: projectId,
      notification: {
        t: new Date(),
        m: `Credentials have been updated ${user && `by ${user.name}`}.`,
        s: "loading",
        v: false,
      },
    },
    user: { external_id: userId },
  });
}
