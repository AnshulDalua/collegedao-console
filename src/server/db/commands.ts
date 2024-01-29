import { prisma } from "@/server/db/prisma";
import raise from "@/utils/raise";

export async function getOrCreateCredentials(
  projectId: string,
  userId: string
) {
  return (
    (await prisma.credentials.findFirst({
      where: {
        projectId,
        project: {
          team: {
            users: { some: { userId } },
          },
        },
      },
    })) ??
    (await prisma.credentials.create({
      data: {
        project: { connect: { id: projectId } },
        contents: {},
      },
    })) ??
    raise("No credentials found attached to Project. Contact support.")
  );
}
