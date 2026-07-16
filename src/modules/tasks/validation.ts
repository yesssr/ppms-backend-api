import { t } from "elysia";
import { TASK_PRIORITY, TASK_STATUS } from "../../constant/enum.js";

export const taskPaginationQuery = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
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
  priority: t.Union([
    t.Literal("low"),
    t.Literal("medium"),
    t.Literal("high"),
    t.Literal("urgent"),
  ]),
  status: t.Union([
    t.Literal("todo"),
    t.Literal("in progress"),
    t.Literal("review"),
    t.Literal("done"),
    t.Literal("cancelled"),
  ]),
  startDate: t.Optional(t.String()),
  dueDate: t.Optional(t.String()),
});

export const updateTaskBody = t.Object({
  title: t.Optional(t.String({ minLength: 1, maxLength: 150 })),
  description: t.Optional(t.String({ maxLength: 2000 })),
  priority: t.Optional(t.Union([
    t.Literal("low"),
    t.Literal("medium"),
    t.Literal("high"),
    t.Literal("urgent"),
  ])),
  status: t.Optional(t.Union([
    t.Literal("todo"),
    t.Literal("in progress"),
    t.Literal("review"),
    t.Literal("done"),
    t.Literal("cancelled"),
  ])),
  startDate: t.Optional(t.String()),
  dueDate: t.Optional(t.String()),
});

export type TaskPaginationQuery = typeof taskPaginationQuery.$infer;
export type TaskParams = typeof taskParams.$infer;
export type TaskBody = typeof taskBody.$infer;
export type UpdateTaskBody = typeof updateTaskBody.$infer;
