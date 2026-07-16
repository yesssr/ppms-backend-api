import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const technology = pgTable("technology", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type Technology = typeof technology.$inferSelect;
export type NewTechnology = typeof technology.$inferInsert;
