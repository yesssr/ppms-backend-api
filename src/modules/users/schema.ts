import { relations } from "drizzle-orm";
import { user, session, account } from "../auth/schema.js";
import { departments } from "../departements/schema.js";
import { teamMember } from "../teams/schema.js";

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  department: one(departments, {
    fields: [user.departmentId],
    references: [departments.id],
  }),
  teamMembers: many(teamMember),
}));

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
