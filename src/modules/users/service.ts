import { db } from "../../db/index.js";
import { user, account } from "../auth/schema.js";
import { NewUser, User } from "./schema.js";
import { hashPassword } from "@better-auth/utils/password";
import { randomUUID } from "crypto";
import { eq, count } from "drizzle-orm";
import { NotFoundError } from "../../utils/errors.js";
import {
  PaginationParams,
  PaginatedResult,
  paginate,
  getPaginationOffset,
} from "../../utils/pagination.js";
import { teamMember, team } from "../teams/schema.js";
import { departments } from "../departements/schema.js";
import { projectMember } from "../projects/schema.js";

export type { User, NewUser } from "./schema.js";

export type UserWithRelations = User & {
  department: (typeof departments.$inferSelect) | null;
  teams: (typeof team.$inferSelect)[];
};

// Hydrate a single user row into the joined shape (department + teams).
const withDepartmentAndTeams = async (
  u: User
): Promise<UserWithRelations> => {
  const [deptRows, teamRows] = await Promise.all([
    u.departmentId
      ? db
          .select()
          .from(departments)
          .where(eq(departments.id, u.departmentId))
          .limit(1)
      : Promise.resolve([]),
    db
      .select({ team })
      .from(teamMember)
      .innerJoin(team, eq(teamMember.teamId, team.id))
      .where(eq(teamMember.userId, u.id)),
  ]);

  return {
    ...u,
    department: deptRows[0] ?? null,
    teams: teamRows.map((r) => r.team),
  };
};

export const getUsers = async (
  params: PaginationParams
): Promise<PaginatedResult<UserWithRelations>> => {
  const offset = getPaginationOffset(params.page, params.limit);

  const [rows, countResult] = await Promise.all([
    db.select().from(user).limit(params.limit).offset(offset),
    db.select({ count: count() }).from(user),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const items = await Promise.all(rows.map(withDepartmentAndTeams));

  return paginate(items, total, params);
};

export const getUserById = async (id: string): Promise<UserWithRelations> => {
  const [result] = await db.select().from(user).where(eq(user.id, id)).limit(1);

  if (!result) {
    throw NotFoundError("User not found", "USER_NOT_FOUND");
  }

  return withDepartmentAndTeams(result);
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role?: string;
  departmentId?: string;
  isActive?: boolean;
  teamIds?: string[];
  projectIds?: string[];
}): Promise<User> => {
  const userId = randomUUID();
  const hashedPassword = await hashPassword(data.password);

  try {
    await db.insert(user).values({
      id: userId,
      name: data.name,
      email: data.email,
      emailVerified: false,
      role: data.role ?? "developer",
      isActive: data.isActive ?? false,
      departmentId: data.departmentId ?? null,
      // Better Auth additionalFields we manage manually.
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    // Provision the credential account so the user can sign in with a password.
    await db.insert(account).values({
      id: randomUUID(),
      accountId: data.email,
      providerId: "credential",
      userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
  } catch (err) {
    console.error("CREATE USER ERROR", err);
    throw new Error("Failed to create user account");
  }

  if (data.teamIds && data.teamIds.length > 0) {
    try {
      const memberValues = data.teamIds.map((teamId) => ({
        teamId,
        userId,
      }));
      await db.insert(teamMember).values(memberValues);
    } catch (err) {
      console.error("CREATE USER TEAM ERROR", err);
      throw new Error("Failed to assign user to teams");
    }
  }

  if (data.projectIds && data.projectIds.length > 0) {
    try {
      const projectMemberValues = data.projectIds.map((projectId) => ({
        projectId,
        userId,
      }));
      await db.insert(projectMember).values(projectMemberValues);
    } catch (err) {
      console.error("CREATE USER PROJECT ERROR", err);
      throw new Error("Failed to assign user to projects");
    }
  }

  return getUserById(userId);
};

export const updateUser = async (
  id: string,
  data: Partial<NewUser> & {
    teamIds?: string[];
    projectIds?: string[];
  }
): Promise<User> => {
  const [result] = await db
    .update(user)
    .set(data)
    .where(eq(user.id, id))
    .returning();

  if (!result) {
    throw NotFoundError("User not found", "USER_NOT_FOUND");
  }

  if (data.teamIds !== undefined) {
    await db.delete(teamMember).where(eq(teamMember.userId, id));
    if (data.teamIds.length > 0) {
      const memberValues = data.teamIds.map((teamId) => ({
        teamId,
        userId: id,
      }));
      await db.insert(teamMember).values(memberValues);
    }
  }

  if (data.projectIds !== undefined) {
    await db.delete(projectMember).where(eq(projectMember.userId, id));
    if (data.projectIds.length > 0) {
      const projectMemberValues = data.projectIds.map((projectId) => ({
        projectId,
        userId: id,
      }));
      await db.insert(projectMember).values(projectMemberValues);
    }
  }

  return result;
};

export const deleteUser = async (id: string): Promise<void> => {
  const [result] = await db.delete(user).where(eq(user.id, id)).returning();

  if (!result) {
    throw NotFoundError("User not found", "USER_NOT_FOUND");
  }
};

export const getUserTeams = async (userId: string) => {
  const result = await db
    .select({ team: require("../teams/schema.js").team })
    .from(teamMember)
    .innerJoin(
      require("../teams/schema.js").team,
      eq(teamMember.teamId, require("../teams/schema.js").team.id)
    )
    .where(eq(teamMember.userId, userId));

  return result.map((t) => t.team);
};
