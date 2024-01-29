import { db } from "@/server/db";
import { prisma } from "@/server/db/prisma";
import redis from "@/server/db/redis";
import { KnownError } from "@/utils/error";
import { createLoopsContact } from "@/utils/loops";

interface CreateUser {
  name: string;
  email: string;
  code?: string;
}

export async function createUser(contents: CreateUser) {
  const projectName =
    contents.name.split(" ")[0]?.toLocaleLowerCase() ?? "default";

  const user = await prisma.user.create({
    data: {
      name: contents.name,
      email: contents.email,
      password: "",
      teams: {
        create: {
          relation: "OWNER",
          assignedBy: "system",
          team: {
            create: {
              name: `${contents.name}'s Team`,
              projects: {
                create: {
                  name: projectName,
                  Credentials: {
                    create: { contents: {} },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) throw new KnownError("User was not created");

  user.password = "";
  user.metadata = "";

  await Promise.all([
    contents.code
      ? redis.del(`code:${contents.email}:${contents.code}`)
      : Promise.resolve(),
    createLoopsContact(user),
  ]);

  return user;
}

export async function deleteUser(id: string) {
  console.log(id);
  // Check for any currently running stacks only owned by this user
  const teams = await prisma.team.findMany({
    where: {
      users: {
        // Prisma Bug: Need to specify empty object for `some` for `every` to work
        some: {},
        every: {
          userId: id,
        },
      },
    },
    include: {
      stacks: {
        select: { name: true, id: true, status: true },
      },
    },
  });

  console.log(
    teams.find((team) =>
      team.stacks.some((stack) => stack.status !== "DELETED")
    )
  );

  // prettier-ignore
  if (teams.some((team) => team.stacks.some((stack) => stack.status !== "DELETED"))) {
    throw new KnownError(
      "Cannot delete user with running stacks. Please stop all stacks before deleting this user."
    );
  }

  // Delete all user's teams
  const teamsDeleted = await prisma.team.deleteMany({
    where: {
      users: {
        // Prisma Bug: Need to specify empty object for `some` for `every` to work
        some: {},
        every: {
          userId: id,
        },
      },
    },
  });

  // Delete user
  const user = await prisma.user.delete({
    where: { id },
    select: { id: true },
  });

  if (!user) throw new KnownError("User was not deleted");

  return {
    user,
    teams: teamsDeleted,
  };
}

export async function getUserByEmail(email: string) {
  const user = await db
    .selectFrom("User")
    .select(["User.id", "name", "email", "createdAt", "updatedAt"])
    .where("email", "=", email)
    .executeTakeFirst();
  
  if (!user) throw new KnownError("User not found");

  return user;
}
