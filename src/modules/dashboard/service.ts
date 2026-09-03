import { db } from "../../db/index.js";
import { project, projectTechnology } from "../projects/schema.js";
import { services } from "../services/schema.js";
import { technology } from "../technology/schema.js";
import { clients } from "../clients/schema.js";
import { testimonial } from "../testimonials/schema.js";
import { eq, count, sql, and, desc, inArray } from "drizzle-orm";
import type {
  DashboardResponse,
  TimelineTrend,
  ProjectByCategory,
  TopTechnology,
  RecentProject,
} from "./schema.js";

export const getDashboard = async (): Promise<DashboardResponse> => {
  const [
    totalProjectsResult,
    completedProjectsResult,
    inProgressProjectsResult,
    totalClientsResult,
    timelineTrendRows,
    projectsByCategoryRows,
    topTechnologiesRows,
    averageRatingResult,
    recentProjectsRows,
  ] = await Promise.all([
    db.select({ count: count() }).from(project),
    db.select({ count: count() }).from(project).where(eq(project.status, "completed")),
    db.select({ count: count() }).from(project).where(eq(project.status, "in progress")),
    db.select({ count: count() }).from(clients),
    getTimelineTrend(),
    getProjectsByCategory(),
    getTopTechnologies(),
    db.select({ avg: sql<number>`AVG(${testimonial.rating})` }).from(testimonial),
    getRecentProjects(),
  ]);

  const totalProjects = Number(totalProjectsResult[0]?.count ?? 0);
  const completedProjects = Number(completedProjectsResult[0]?.count ?? 0);
  const inProgressProjects = Number(inProgressProjectsResult[0]?.count ?? 0);
  const totalClients = Number(totalClientsResult[0]?.count ?? 0);
  const averageRating = averageRatingResult[0]?.avg ? Number(averageRatingResult[0].avg) : null;

  return {
    summary: {
      totalProjects,
      completedProjects,
      inProgressProjects,
      totalClients,
    },
    timelineTrend: timelineTrendRows,
    projectsByCategory: projectsByCategoryRows,
    topTechnologies: topTechnologiesRows,
    clientSatisfaction: {
      averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null,
    },
    recentProjects: recentProjectsRows,
  };
};

const getTimelineTrend = async (): Promise<TimelineTrend[]> => {
  const result = await db.execute(
    sql`
      SELECT
        to_char(date_trunc('month', ${project.createdAt}), 'YYYY-MM') as month,
        count(*) FILTER (WHERE ${project.status} = 'in progress') as "inProgress",
        count(*) FILTER (WHERE ${project.status} = 'completed') as completed,
        count(*) as total
      FROM ${project}
      WHERE ${project.createdAt} >= (now() - interval '6 months')
      GROUP BY 1
      ORDER BY 1 ASC
    `
  );

  const rows = (result as any).rows ?? result;

  return (rows as any[]).map((row: any) => ({
    month: row.month,
    inProgress: Number(row.inProgress ?? 0),
    completed: Number(row.completed ?? 0),
    total: Number(row.total ?? 0),
  }));
};

const getProjectsByCategory = async (): Promise<ProjectByCategory[]> => {
  const rows = await db
    .select({
      serviceId: services.id,
      serviceName: services.name,
      count: count(project.id),
    })
    .from(services)
    .leftJoin(project, eq(project.serviceId, services.id))
    .groupBy(services.id, services.name)
    .orderBy(desc(count(project.id)));

  return rows.map((row) => ({
    serviceId: row.serviceId,
    serviceName: row.serviceName,
    count: Number(row.count ?? 0),
  }));
};

const getTopTechnologies = async (): Promise<TopTechnology[]> => {
  const totalActiveResult = await db
    .select({ count: count() })
    .from(project)
    .where(
      inArray(project.status, ["planning", "in progress"])
    );

  const totalActive = Number(totalActiveResult[0]?.count ?? 0);

  if (totalActive === 0) {
    return [];
  }

  const rows = await db
    .select({
      technologyId: technology.id,
      technologyName: technology.name,
      usageCount: count(),
    })
    .from(projectTechnology)
    .innerJoin(project, eq(project.id, projectTechnology.projectId))
    .innerJoin(technology, eq(technology.id, projectTechnology.technologyId))
    .where(
      inArray(project.status, ["planning", "in progress"])
    )
    .groupBy(technology.id, technology.name)
    .orderBy(desc(count()))
    .limit(10);

  return rows.map((row) => ({
    technologyId: row.technologyId,
    technologyName: row.technologyName,
    usagePercentage: Math.round((Number(row.usageCount ?? 0) / totalActive) * 100),
  }));
};

const getRecentProjects = async (): Promise<RecentProject[]> => {
  const rows = await db
    .select({
      id: project.id,
      name: project.name,
      clientName: clients.name,
      status: project.status,
      createdAt: project.createdAt,
    })
    .from(project)
    .leftJoin(clients, eq(clients.id, project.clientId))
    .orderBy(desc(project.createdAt))
    .limit(5);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    clientName: row.clientName ?? null,
    status: row.status,
    createdAt: row.createdAt,
  }));
};
