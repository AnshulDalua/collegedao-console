import { db } from "@/server/db";
import { KnownError } from "@/utils/error";


/** Get Running Stack
 * 
 * @param type The type of stack to get
 * @param stackId The ID of the stack to get
 * @param userId The ID of the user to authenticate
 * @returns The stack
 */
export async function getRunningStack(
  type = "Stack",
  stackId?: string,
  userId?: string
) {
  if (!stackId) throw new KnownError(`${type ?? "Stack"} id not found`);
  if (!userId) throw new KnownError("User not found");

  const stack = await db
    .selectFrom("Stack")
    .select(["Stack.id", "type", "status", "output", "input"])
    .innerJoin("UsersOnTeams", "UsersOnTeams.teamId", "Stack.teamId")
    .where("Stack.id", "=", stackId)
    .where("UsersOnTeams.userId", "=", userId)
    .executeTakeFirst();
  if (!stack) throw new KnownError(`${type ?? "Stack"} not found`);
  if (stack.status === "PENDING")
    throw new KnownError(`${type ?? "Stack"} is currently pending`);
  if (stack.status !== "RUNNING")
    throw new KnownError(`${type ?? "Stack"} is not running`);

  return stack;
}
