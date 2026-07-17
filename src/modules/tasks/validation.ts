import { t, type TSchema } from "elysia";
import { TASK_PRIORITY, TASK_STATUS } from "../../constant/enum.js";

const enumUnion = (values: readonly string[]) =>
  t.Union(
    values.map((v) => t.Literal(v)) as unknown as [TSchema, ...TSchema[]]
  );

export const taskPaginationQuery = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
  search: t.Optional(t.String()),
  projectId: t.Optional(t.String({ format: "uuid" })),
});

export const taskParams = t.Object({
  id: t.String({ format: "uuid" }),
});

export const taskBody = t.Object({
  projectId: t.String({ format: "uuid" }),
  assigneeId: t.String(),
  createdBy: t.String(),
  title: t.String({ minLength: 1, maxLength: 150 }),
  description: t.Optional(t.String({ maxLength: 2000 })),
  priority: enumUnion(TASK_PRIORITY),
  status: enumUnion(TASK_STATUS),
  startDate: t.Optional(t.String()),
  dueDate: t.Optional(t.String()),
});

export const updateTaskBody = t.Object({
  title: t.Optional(t.String({ minLength: 1, maxLength: 150 })),
  description: t.Optional(t.String({ maxLength: 2000 })),
  priority: t.Optional(enumUnion(TASK_PRIORITY)),
  status: t.Optional(enumUnion(TASK_STATUS)),
  startDate: t.Optional(t.String()),
  dueDate: t.Optional(t.String()),
});

export type TaskPaginationQuery = typeof taskPaginationQuery.$infer;
export type TaskParams = typeof taskParams.$infer;
export type TaskBody = typeof taskBody.$infer;
export type UpdateTaskBody = typeof updateTaskBody.$infer;
