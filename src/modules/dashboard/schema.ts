export type DashboardSummary = {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  totalClients: number;
};

export type TimelineTrend = {
  month: string;
  inProgress: number;
  completed: number;
  total: number;
};

export type ProjectByCategory = {
  serviceId: string;
  serviceName: string;
  count: number;
};

export type TopTechnology = {
  technologyId: string;
  technologyName: string;
  usagePercentage: number;
};

export type ClientSatisfaction = {
  averageRating: number | null;
};

export type RecentProject = {
  id: string;
  name: string;
  clientName: string | null;
  status: string;
  createdAt: Date;
};

export type DashboardResponse = {
  summary: DashboardSummary;
  timelineTrend: TimelineTrend[];
  projectsByCategory: ProjectByCategory[];
  topTechnologies: TopTechnology[];
  clientSatisfaction: ClientSatisfaction;
  recentProjects: RecentProject[];
};
