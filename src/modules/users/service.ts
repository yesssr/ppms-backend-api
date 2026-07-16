import { db } from "../../db/index.js";
import { user } from "../auth/schema.js";
import { NewUser, User } from "./schema.js";
import { eq, count } from "drizzle-orm";
import { NotFoundError } from "../../utils/errors.js";
import {
  PaginationParams,
  PaginatedResult,
  paginate,
  getPaginationOffset,
} from "../../utils/pagination.js";
import { auth } from "../auth/auth.js";
import { teamMember } from "../teams/schema.js";
import { projectMember } from "../projects/schema.js";

export type { User, NewUser } from "./schema.js";

export const getUsers = async (
  params: PaginationParams
): Promise<PaginatedResult<User>> => {
  const offset = getPaginationOffset(params.page, params.limit);

  const [items, countResult] = await Promise.all([
    db.select().from(user).limit(params.limit).offset(offset),
    db.select({ count: count() }).from(user),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return paginate(items, total, params);
};

export const getUserById = async (id: string): Promise<User> => {
  const [result] = await db.select().from(user).where(eq(user.id, id)).limit(1);

  if (!result) {
    throw NotFoundError("User not found", "USER_NOT_FOUND");
  }

  return result;
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
  let userId: string;

  try {
    const result = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role ?? "developer",
        isActive: data.isActive ?? false,
      },
    });

    if (!result?.user) {
      throw new Error("Failed to create user");
    }

    userId = result.user.id;
  } catch (err) {
    console.error("CREATE USER SIGNUP ERROR", err);
    throw new Error("Failed to create user account");
  }

  try {
    await db
      .update(user)
      .set({
        departmentId: data.departmentId ?? null,
      })
      .where(eq(user.id, userId));
  } catch (err) {
    console.error("CREATE USER UPDATE ERROR", err);
    throw new Error("Failed to update user profile");
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
