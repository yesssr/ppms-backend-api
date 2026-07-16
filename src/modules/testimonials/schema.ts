import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { project } from "../projects/schema.js";

export const testimonial = pgTable("testimonial", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  clientName: text("client_name").notNull(),
  rating: integer("rating").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const testimonialRelations = relations(testimonial, ({ one }) => ({
  project: one(project, {
    fields: [testimonial.projectId],
    references: [project.id],
  }),
}));

export type Testimonial = typeof testimonial.$inferSelect;
export type NewTestimonial = typeof testimonial.$inferInsert;
