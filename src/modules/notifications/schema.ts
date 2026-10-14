import { pgTable, uuid, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "../auth/schema.js";

export const notification = pgTable(
  "notification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    type: text("type").notNull(),
    referenceId: text("reference_id"),
    referenceType: text("reference_type"),
    isRead: boolean("is_read").default(false).notNull(),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notification_user_id_idx").on(table.userId),
    index("notification_expires_at_idx").on(table.expiresAt),
    index("notification_user_is_read_idx").on(table.userId, table.isRead),
  ]
);

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}));

export type Notification = typeof notification.$inferSelect;
export type NewNotification = typeof notification.$inferInsert;

export const NOTIFICATION_TYPES = [
  "team_added",
  "task_assigned",
  "task_deadline_approaching",
  "project_deadline_approaching",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];