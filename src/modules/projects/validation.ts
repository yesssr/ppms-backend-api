import { t, type TSchema } from "elysia";
import { PROJECT_STATUS } from "../../constant/enum.js";

const enumUnion = (values: readonly string[]) =>
  t.Union(
    values.map((v) => t.Literal(v)) as unknown as [TSchema, ...TSchema[]]
  );

export const projectPaginationQuery = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
  search: t.Optional(t.String()),
  serviceId: t.Optional(t.String({ format: "uuid" })),
  status: t.Optional(enumUnion(PROJECT_STATUS)),
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
  thumbnailFile: t.Optional(t.File({ maxSize: 10 * 1024 * 1024 })),
  status: enumUnion(PROJECT_STATUS),
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
  thumbnailFile: t.Optional(t.File({ maxSize: 10 * 1024 * 1024 })),
  status: t.Optional(enumUnion(PROJECT_STATUS)),
  budget: t.Optional(t.String()),
  startDate: t.Optional(t.String()),
  endDate: t.Optional(t.String()),
  technologyIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
  memberIds: t.Optional(t.Array(t.String())),
  teamIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
});

export const updateProjectProgressBody = t.Object({
  progressPercentage: t.Number({ minimum: 0, maximum: 100 }),
  message: t.Optional(t.String({ maxLength: 1000 })),
});

export type ProjectPaginationQuery = typeof projectPaginationQuery.$infer;
export type ProjectParams = typeof projectParams.$infer;
export type ProjectBody = typeof projectBody.$infer;
export type UpdateProjectBody = typeof updateProjectBody.$infer;
export type UpdateProjectProgressBody = typeof updateProjectProgressBody.$infer;
