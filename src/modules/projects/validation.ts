import { t } from "elysia";
import type { NewProject } from "./schema.js";
import { PROJECT_STATUS } from "../../constant/enum.js";

export const projectPaginationQuery = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
});

export const projectParams = t.Object({
  id: t.String({ format: "uuid" }),
});

export const projectBody = t.Object({
  serviceId: t.String({ format: "uuid" }),
  createdBy: t.String(),
  name: t.String({ minLength: 1, maxLength: 150 }),
  clientName: t.String({ minLength: 1, maxLength: 150 }),
  description: t.Optional(t.String({ maxLength: 2000 })),
  repositoryUrl: t.Optional(t.String({ maxLength: 500 })),
  demoUrl: t.Optional(t.String({ maxLength: 500 })),
  thumbnail: t.Optional(t.String({ maxLength: 500 })),
  status: t.Union([t.Literal("planning"), t.Literal("in progress"), t.Literal("completed"), t.Literal("on hold")]),
  budget: t.Optional(t.String()),
  startDate: t.Optional(t.String()),
  endDate: t.Optional(t.String()),
  technologyIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
  memberIds: t.Optional(t.Array(t.String())),
  teamIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
});

export const updateProjectBody = t.Object({
  serviceId: t.Optional(t.String({ format: "uuid" })),
  name: t.Optional(t.String({ minLength: 1, maxLength: 150 })),
  clientName: t.Optional(t.String({ minLength: 1, maxLength: 150 })),
  description: t.Optional(t.String({ maxLength: 2000 })),
  repositoryUrl: t.Optional(t.String({ maxLength: 500 })),
  demoUrl: t.Optional(t.String({ maxLength: 500 })),
  thumbnail: t.Optional(t.String({ maxLength: 500 })),
  status: t.Optional(t.Union([t.Literal("planning"), t.Literal("in progress"), t.Literal("completed"), t.Literal("on hold")])),
  budget: t.Optional(t.String()),
  startDate: t.Optional(t.String()),
  endDate: t.Optional(t.String()),
  technologyIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
  memberIds: t.Optional(t.Array(t.String())),
  teamIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
});

export type ProjectPaginationQuery = typeof projectPaginationQuery.$infer;
export type ProjectParams = typeof projectParams.$infer;
export type ProjectBody = typeof projectBody.$infer;
export type UpdateProjectBody = typeof updateProjectBody.$infer;
