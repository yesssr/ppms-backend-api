import { pgTable, uuid, text, timestamp, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { project } from "../projects/schema.js";

export const caseStudy = pgTable("case_study", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  challenge: text("challenge").notNull(),
  solution: text("solution").notNull(),
  outcome: text("outcome").notNull(),
  coverImage: text("cover_image"),
  status: text("status").notNull(),
  tags: text("tags"),
  publishedAt: date("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const caseStudyRelations = relations(caseStudy, ({ one }) => ({
  project: one(project, {
    fields: [caseStudy.projectId],
    references: [project.id],
  }),
}));

export type CaseStudy = typeof caseStudy.$inferSelect;
export type NewCaseStudy = typeof caseStudy.$inferInsert;
