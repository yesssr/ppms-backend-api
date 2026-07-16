import { pgTable, uuid, text, timestamp, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "../auth/schema.js";
import { project } from "../projects/schema.js";

export const task = pgTable("task", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  assigneeId: text("assignee_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull(),
  status: text("status").notNull(),
  startDate: date("start_date"),
  dueDate: date("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const taskRelations = relations(task, ({ one }) => ({
  project: one(project, {
    fields: [task.projectId],
    references: [project.id],
  }),
  assignee: one(user, {
    fields: [task.assigneeId],
    references: [user.id],
  }),
  creator: one(user, {
    fields: [task.createdBy],
    references: [user.id],
  }),
}));

export type Task = typeof task.$inferSelect;
export type NewTask = typeof task.$inferInsert;
