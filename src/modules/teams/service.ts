import { db } from "../../db/index.js";
import {
  team,
  teamMember,
  NewTeam,
  Team,
  NewTeamMember,
  TeamMember,
} from "./schema.js";
import { eq, count, and, sql } from "drizzle-orm";
import { NotFoundError } from "../../utils/errors.js";
import {
  PaginationParams,
  PaginatedResult,
  paginate,
  getPaginationOffset,
} from "../../utils/pagination.js";

export type { Team, NewTeam, TeamMember, NewTeamMember } from "./schema.js";

export const getTeams = async (
  params: PaginationParams
): Promise<PaginatedResult<Team>> => {
  const offset = getPaginationOffset(params.page, params.limit);

  const [items, countResult] = await Promise.all([
    db.select().from(team).limit(params.limit).offset(offset),
    db.select({ count: count() }).from(team),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return paginate(items, total, params);
};

export const getTeamById = async (id: string): Promise<Team> => {
  const [result] = await db.select().from(team).where(eq(team.id, id)).limit(1);

  if (!result) {
    throw NotFoundError("Team not found", "TEAM_NOT_FOUND");
  }

  return result;
};

export const createTeam = async (data: NewTeam): Promise<Team> => {
  const [result] = await db.insert(team).values(data).returning();
  return result;
};

export const updateTeam = async (
  id: string,
  data: Partial<NewTeam>
): Promise<Team> => {
  const [result] = await db
    .update(team)
    .set(data)
    .where(eq(team.id, id))
    .returning();

  if (!result) {
    throw NotFoundError("Team not found", "TEAM_NOT_FOUND");
  }

  return result;
};

export const deleteTeam = async (id: string): Promise<void> => {
  const [result] = await db.delete(team).where(eq(team.id, id)).returning();

  if (!result) {
    throw NotFoundError("Team not found", "TEAM_NOT_FOUND");
  }
};

export const getTeamMembers = async (teamId: string) => {
  const members = await db
    .select()
    .from(teamMember)
    .where(eq(teamMember.teamId, teamId));

  return members;
};

export const addTeamMember = async (
  data: NewTeamMember
): Promise<TeamMember> => {
  const [result] = await db.insert(teamMember).values(data).returning();
  return result;
};

export const removeTeamMember = async (
  teamId: string,
  userId: string
): Promise<void> => {
  const [result] = await db
    .delete(teamMember)
    .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
    .returning();

  if (!result) {
    throw NotFoundError("Team member not found", "TEAM_MEMBER_NOT_FOUND");
  }
};

export const getUserTeams = async (userId: string): Promise<Team[]> => {
  const result = await db
    .select({ team })
    .from(teamMember)
    .innerJoin(team, eq(teamMember.teamId, team.id))
    .where(eq(teamMember.userId, userId));

  return result.map((r) => r.team);
};
