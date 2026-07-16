import { pgTable, uuid, text, timestamp, bigint } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { project } from "../projects/schema.js";
import { user } from "../auth/schema.js";

export const document = pgTable("document", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  fileName: text("file_name").notNull(),
  fileKey: text("file_key").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: bigint("file_size", { mode: "number" }).notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const documentRelations = relations(document, ({ one }) => ({
  project: one(project, {
    fields: [document.projectId],
    references: [project.id],
  }),
  uploader: one(user, {
    fields: [document.uploadedBy],
    references: [user.id],
  }),
}));

export type Document = typeof document.$inferSelect;
export type NewDocument = typeof document.$inferInsert;
