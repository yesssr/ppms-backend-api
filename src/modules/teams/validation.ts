import { t } from "elysia";
import type { NewTeam, NewTeamMember } from "./schema.js";

export const teamPaginationQuery = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
});

export const teamParams = t.Object({
  id: t.String({ format: "uuid" }),
});

export const teamBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  description: t.Optional(t.String({ maxLength: 500 })),
});

export const addMemberBody = t.Object({
  userId: t.String(),
});

export type TeamPaginationQuery = typeof teamPaginationQuery.$infer;
export type TeamParams = typeof teamParams.$infer;
export type TeamBody = typeof teamBody.$infer;
export type TeamUpdateBody = {
  name?: string;
  description?: string;
};
export type AddMemberBody = typeof addMemberBody.$infer;
