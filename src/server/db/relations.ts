import { ExpressionBuilder } from "kysely";
import { DB } from "kysely-codegen";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/mysql";

import { db } from "../db";

export function withProjects(eb: ExpressionBuilder<DB, "User">) {
  return jsonArrayFrom(
    eb
      .selectFrom("Project")
      .select(["Project.id", "name", "createdAt", "updatedAt"])
      .innerJoin("UsersOnTeams", "UsersOnTeams.userId", "User.id")
      .whereRef("UsersOnTeams.teamId", "=", "Project.teamId")
  ).as("projects");
}

export function withStacks(eb: ExpressionBuilder<DB, "Project">) {
  return jsonArrayFrom(
    eb
      .selectFrom("Stack")
      .select([
        "id",
        "name",
        "type",
        "status",
        "input",
        "createdAt",
        "updatedAt",
        "error",
      ])
      .whereRef("Stack.projectId", "=", "Project.id")
  ).as("stacks");
}

export function withStack(eb: ExpressionBuilder<DB, "Project">, id: string) {
  return jsonObjectFrom(
    eb
      .selectFrom("Stack")
      .select([
        "id",
        "name",
        "type",
        "status",
        "input",
        "createdAt",
        "updatedAt",
        "error",
      ])
      .where("Stack.id", "=", id)
      .limit(1)
  ).as("stack");
}

export function withProjectsAndCredentials(eb: ExpressionBuilder<DB, "User">) {
  return jsonArrayFrom(
    eb
      .selectFrom("Project")
      .select(["Project.id", "name", "createdAt", "updatedAt"])
      // @ts-ignore - This is correct but the types are mismatch and fix is not clean
      .select((ep) => [withCredentials(ep)])
      .innerJoin("UsersOnTeams", "UsersOnTeams.userId", "User.id")
      .whereRef("UsersOnTeams.teamId", "=", "Project.teamId")
  ).as("projects");
}

export function withPersonalTeam(eb: ExpressionBuilder<DB, "User">) {
  return jsonArrayFrom(
    eb
      .selectFrom("Team")
      .innerJoin("UsersOnTeams", "UsersOnTeams.teamId", "Team.id")
      .whereRef("UsersOnTeams.userId", "=", "User.id")
      .select([
        "id",
        "name",
        "createdAt",
        "updatedAt",
        "UsersOnTeams.teamId",
        "UsersOnTeams.userId",
      ])
  ).as("team");
}

export function withCredentials(eb: ExpressionBuilder<DB, "Project">) {
  return jsonObjectFrom(
    eb
      .selectFrom("Credentials")
      .select(["Credentials.id", "contents", "projectId"])
      .whereRef("Credentials.projectId", "=", "Project.id")
  ).as("credentials");
}
export function stackWithCredentials(eb: ExpressionBuilder<DB, "Stack">) {
  return jsonObjectFrom(
    eb
      .selectFrom("Credentials")
      .select(["Credentials.id", "contents", "projectId"])
      .whereRef("Credentials.projectId", "=", "Stack.projectId")
  ).as("credentials");
}

export function projectWithCredentials(projectId: string, userId: string) {
  return db
    .selectFrom("Project")
    .select(["Project.id"])
    .select((eb) => [withCredentials(eb)])
    .innerJoin("UsersOnTeams", "UsersOnTeams.teamId", "Project.teamId")
    .where("Project.id", "=", projectId)
    .where("UsersOnTeams.userId", "=", userId)
    .executeTakeFirst();
}

export function stackWithUserIdandId(stackId: string, userId: string) {
  return db
    .selectFrom("Stack")
    .select(["Stack.id", "Stack.status", "Stack.name", "Stack.type"])
    .innerJoin("UsersOnTeams", "UsersOnTeams.teamId", "Stack.teamId")
    .where("Stack.id", "=", stackId)
    .where("UsersOnTeams.userId", "=", userId)
    .executeTakeFirst();
}

export function setStackToDelete(stackId: string, userId: string) {
  return db
    .updateTable("Stack")
    .set({ status: "DELETED" })
    .where("Stack.id", "=", stackId)
    .where(
      "Stack.teamId",
      "in",
      db
        .selectFrom("UsersOnTeams")
        .select("teamId")
        .where("UsersOnTeams.userId", "=", userId)
    )
    .executeTakeFirst();
}

export function fromStackIdGetCredentials(
  stackId: string,
  projectId?: string,
  userId?: string
) {
  return db
    .selectFrom("Credentials")
    .select("contents")
    .leftJoin("Project", "Project.id", "Credentials.projectId")
    .leftJoin("Stack", "Stack.projectId", "Project.id")
    .$if(typeof userId === "string", (eb) =>
      eb
        .leftJoin("UsersOnTeams", "UsersOnTeams.teamId", "Stack.teamId")
        .where("UsersOnTeams.userId", "=", userId as string)
    )
    .$if(typeof projectId === "string", (eb) =>
      eb.where("Project.id", "=", projectId as string)
    )
    .where("Stack.id", "=", stackId)
    .executeTakeFirst();
}

export function getCredentials(projectId: string, userId: string) {
  return db
    .selectFrom("Credentials")
    .select("contents")
    .leftJoin("Project", "Project.id", "Credentials.projectId")
    .leftJoin("UsersOnTeams", "UsersOnTeams.teamId", "Project.teamId")
    .where("UsersOnTeams.userId", "=", userId)
    .where("Project.id", "=", projectId)
    .executeTakeFirst();
}
