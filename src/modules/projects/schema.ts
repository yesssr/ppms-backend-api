import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "../auth/schema.js";
import { services } from "../services/schema.js";
import { technology } from "../technology/schema.js";

export const project = pgTable("project", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "restrict" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  clientName: text("client_name").notNull(),
  description: text("description"),
  repositoryUrl: text("repository_url"),
  demoUrl: text("demo_url"),
  thumbnail: text("thumbnail"),
  code: text("code").unique(),
  status: text("status").notNull(),
  progressPercentage: integer("progress_percentage").default(0).notNull(),
  lastChange: timestamp("last_change").defaultNow().notNull(),
  budget: text("budget"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const projectMember = pgTable(
  "project_member",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [
    {
      name: "project_member_unique",
      columns: [table.projectId, table.userId],
      unique: true,
    },
  ]
);

export const projectTechnology = pgTable(
  "project_technology",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    technologyId: uuid("technology_id")
      .notNull()
      .references(() => technology.id, { onDelete: "cascade" }),
  },
  (table) => [
    {
      name: "project_technology_unique",
      columns: [table.projectId, table.technologyId],
      unique: true,
    },
  ]
);

export const projectRelations = relations(project, ({ many, one }) => ({
  members: many(projectMember),
  technologies: many(projectTechnology),
  creator: one(user, {
    fields: [project.createdBy],
    references: [user.id],
  }),
  service: one(services, {
    fields: [project.serviceId],
    references: [services.id],
  }),
}));

export const projectMemberRelations = relations(projectMember, ({ one }) => ({
  project: one(project, {
    fields: [projectMember.projectId],
    references: [project.id],
  }),
  user: one(user, {
    fields: [projectMember.userId],
    references: [user.id],
  }),
}));

export const projectTechnologyRelations = relations(projectTechnology, ({ one }) => ({
  project: one(project, {
    fields: [projectTechnology.projectId],
    references: [project.id],
  }),
  technology: one(technology, {
    fields: [projectTechnology.technologyId],
    references: [technology.id],
  }),
}));

// Resi-style progress history: every progress update is a tracked row so the
// client can monitor the project timeline publicly (like checking a delivery).
export const projectLog = pgTable("project_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  progressPercentage: integer("progress_percentage").notNull(),
  message: text("message"),
  updatedBy: text("updated_by").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectLogRelations = relations(projectLog, ({ one }) => ({
  project: one(project, {
    fields: [projectLog.projectId],
    references: [project.id],
  }),
  updater: one(user, {
    fields: [projectLog.updatedBy],
    references: [user.id],
  }),
}));

export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;
export type ProjectMember = typeof projectMember.$inferSelect;
export type NewProjectMember = typeof projectMember.$inferInsert;
export type ProjectTechnology = typeof projectTechnology.$inferSelect;
export type NewProjectTechnology = typeof projectTechnology.$inferInsert;
export type ProjectLog = typeof projectLog.$inferSelect;
export type NewProjectLog = typeof projectLog.$inferInsert;
