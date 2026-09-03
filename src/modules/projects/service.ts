import { db } from "../../db/index.js";
import {
  project,
  projectMember,
  projectTechnology,
  projectLog,
  NewProject,
  Project,
  ProjectLog,
  ProjectWithClient,
} from "./schema.js";
import { eq, count, and, sql, inArray, ilike, or } from "drizzle-orm";
import { NotFoundError, ConflictError } from "../../utils/errors.js";
import {
  PaginationParams,
  PaginatedResult,
  paginate,
  getPaginationOffset,
} from "../../utils/pagination.js";
import { storageService } from "../../utils/storage.js";
import { teamMember } from "../teams/schema.js";
import { clients } from "../clients/schema.js";

export type { Project, NewProject, ProjectWithClient } from "./schema.js";

const withClient = async (p: Project): Promise<ProjectWithClient> => {
  const [clientRow] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, p.clientId))
    .limit(1);

  return {
    ...p,
    clientName: clientRow?.name ?? null,
  };
};

export const getProjects = async (
  params: PaginationParams & {
    search?: string;
    serviceId?: string;
    status?: string;
  }
): Promise<PaginatedResult<ProjectWithClient>> => {
  const offset = getPaginationOffset(params.page, params.limit);

  const conditions = [];

  if (params.search) {
    conditions.push(
      or(
        ilike(project.name, `%${params.search}%`),
        ilike(clients.name, `%${params.search}%`)
      )
    );
  }

  if (params.serviceId) {
    conditions.push(eq(project.serviceId, params.serviceId));
  }

  if (params.status) {
    conditions.push(eq(project.status, params.status));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, countResult] = await Promise.all([
    db
      .select({ project, client: clients })
      .from(project)
      .leftJoin(clients, eq(project.clientId, clients.id))
      .where(whereClause)
      .limit(params.limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(project)
      .leftJoin(clients, eq(project.clientId, clients.id))
      .where(whereClause),
  ]);

  const data = items.map(({ project, client }) => ({
    ...project,
    clientName: client?.name ?? null,
  }));

  const total = Number(countResult[0]?.count ?? 0);

  return paginate(data, total, params);
};

export const getProjectById = async (id: string): Promise<ProjectWithClient> => {
  const [result] = await db
    .select({ project, client: clients })
    .from(project)
    .leftJoin(clients, eq(project.clientId, clients.id))
    .where(eq(project.id, id))
    .limit(1);

  if (!result) {
    throw NotFoundError("Project not found", "PROJECT_NOT_FOUND");
  }

  return {
    ...result.project,
    clientName: result.client?.name ?? null,
  };
};

export const generateProjectCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `PRJ-${suffix}`;
};

export const createProject = async (data: {
  serviceId: string;
  createdBy: string;
  name: string;
  clientId: string;
  description?: string;
  repositoryUrl?: string;
  demoUrl?: string;
  thumbnail?: string;
  status: string;
  budget?: string;
  startDate?: string;
  endDate?: string;
  technologyIds?: string[];
  memberIds?: string[];
  teamIds?: string[];
}): Promise<ProjectWithClient> => {
  const [result] = await db
    .insert(project)
    .values({
      code: generateProjectCode(),
      serviceId: data.serviceId,
      clientId: data.clientId,
      createdBy: data.createdBy,
      name: data.name,
      description: data.description,
      repositoryUrl: data.repositoryUrl,
      demoUrl: data.demoUrl,
      thumbnail: data.thumbnail,
      status: data.status,
      budget: data.budget,
      startDate: data.startDate,
      endDate: data.endDate,
    })
    .returning();

  const projectId = result.id;

  if (data.technologyIds && data.technologyIds.length > 0) {
    const techValues = data.technologyIds.map((technologyId) => ({
      projectId,
      technologyId,
    }));
    await db.insert(projectTechnology).values(techValues);
  }

  const allMemberIds = new Set<string>(data.memberIds || []);

  if (data.teamIds && data.teamIds.length > 0) {
    const teamUsers = await db
      .select({ userId: teamMember.userId })
      .from(teamMember)
      .where(inArray(teamMember.teamId, data.teamIds));

    teamUsers.forEach((u) => allMemberIds.add(u.userId));
  }

  if (allMemberIds.size > 0) {
    const memberValues = Array.from(allMemberIds).map((userId) => ({
      projectId,
      userId,
    }));
    await db.insert(projectMember).values(memberValues);
  }

  return getProjectById(projectId);
};

export const updateProject = async (
  id: string,
  data: Partial<NewProject> & {
    technologyIds?: string[];
    memberIds?: string[];
    teamIds?: string[];
  }
): Promise<ProjectWithClient> => {
  const updateData: Record<string, unknown> = { ...data };
  delete updateData.technologyIds;
  delete updateData.memberIds;
  delete updateData.teamIds;

  const [result] = await db
    .update(project)
    .set(updateData)
    .where(eq(project.id, id))
    .returning();

  if (!result) {
    throw NotFoundError("Project not found", "PROJECT_NOT_FOUND");
  }

  if (data.technologyIds !== undefined) {
    await db.delete(projectTechnology).where(eq(projectTechnology.projectId, id));
    if (data.technologyIds.length > 0) {
      const techValues = data.technologyIds.map((technologyId) => ({
        projectId: id,
        technologyId,
      }));
      await db.insert(projectTechnology).values(techValues);
    }
  }

  if (data.memberIds !== undefined || data.teamIds !== undefined) {
    const allMemberIds = new Set<string>(data.memberIds || []);

    if (data.teamIds && data.teamIds.length > 0) {
      const teamUsers = await db
        .select({ userId: teamMember.userId })
        .from(teamMember)
        .where(inArray(teamMember.teamId, data.teamIds));

      teamUsers.forEach((u) => allMemberIds.add(u.userId));
    }

    await db.delete(projectMember).where(eq(projectMember.projectId, id));
    if (allMemberIds.size > 0) {
      const memberValues = Array.from(allMemberIds).map((userId) => ({
        projectId: id,
        userId,
      }));
      await db.insert(projectMember).values(memberValues);
    }
  }

  return getProjectById(id);
};

export const deleteProject = async (id: string): Promise<void> => {
  const [result] = await db.delete(project).where(eq(project.id, id)).returning();

  if (!result) {
    throw NotFoundError("Project not found", "PROJECT_NOT_FOUND");
  }
};

// Developer updates progress. Updates the project's progress + lastChange and
// records a resi-style log row so the client can track the full timeline.
export const updateProjectProgress = async (
  id: string,
  data: {
    progressPercentage: number;
    message?: string;
    updatedBy?: string;
  }
): Promise<ProjectWithClient> => {
  const existing = await getProjectById(id);

  const [result] = await db
    .update(project)
    .set({
      progressPercentage: data.progressPercentage,
      lastChange: new Date(),
    })
    .where(eq(project.id, id))
    .returning();

  await db.insert(projectLog).values({
    projectId: id,
    progressPercentage: data.progressPercentage,
    message: data.message ?? null,
    updatedBy: data.updatedBy ?? null,
  });

  return getProjectById(id);
};

// Public lookup by tracking code (no auth). Used by the client tracking page.
export const getProjectByIdentifier = async (code: string): Promise<ProjectWithClient> => {
  const [result] = await db
    .select({ project, client: clients })
    .from(project)
    .leftJoin(clients, eq(project.clientId, clients.id))
    .where(eq(project.code, code))
    .limit(1);

  if (!result) {
    throw NotFoundError("Project not found", "PROJECT_NOT_FOUND");
  }

  return {
    ...result.project,
    clientName: result.client?.name ?? null,
  };
};

// Full progress timeline (resi-style) for a project.
export const getProjectLogs = async (
  projectId: string
): Promise<ProjectLog[]> => {
  const logs = await db
    .select()
    .from(projectLog)
    .where(eq(projectLog.projectId, projectId))
    .orderBy(projectLog.createdAt);

  return logs;
};

export const addProjectTechnology = async (
  projectId: string,
  technologyId: string
) => {
  const [result] = await db
    .insert(projectTechnology)
    .values({
      projectId,
      technologyId,
    })
    .returning();

  return result;
};

export const removeProjectTechnology = async (
  projectId: string,
  technologyId: string
) => {
  const [result] = await db
    .delete(projectTechnology)
    .where(
      and(
        eq(projectTechnology.projectId, projectId),
        eq(projectTechnology.technologyId, technologyId)
      )
    )
    .returning();

  if (!result) {
    throw NotFoundError(
      "Project technology not found",
      "PROJECT_TECHNOLOGY_NOT_FOUND"
    );
  }
};

export const addProjectMember = async (projectId: string, userId: string) => {
  const [result] = await db
    .insert(projectMember)
    .values({
      projectId,
      userId,
    })
    .returning();

  return result;
};

export const removeProjectMember = async (
  projectId: string,
  userId: string
) => {
  const [result] = await db
    .delete(projectMember)
    .where(
      and(
        eq(projectMember.projectId, projectId),
        eq(projectMember.userId, userId)
      )
    )
    .returning();

  if (!result) {
    throw NotFoundError("Project member not found", "PROJECT_MEMBER_NOT_FOUND");
  }
};

export const uploadThumbnail = async (
  key: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> => {
  return storageService.upload(key, buffer, mimeType);
};

export const deleteThumbnail = async (key: string): Promise<void> => {
  return storageService.delete(key);
};

export const getThumbnailPublicUrl = (key: string): string => {
  return storageService.getPublicUrl(key);
};

export const generateThumbnailKey = (filename: string): string => {
  return storageService.generateKey("projects/thumbnails", filename);
};
