import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
