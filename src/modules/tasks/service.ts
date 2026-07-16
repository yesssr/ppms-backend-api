import { db } from "../../db/index.js";
import { task, NewTask, Task } from "./schema.js";
import { eq, count } from "drizzle-orm";
import { NotFoundError } from "../../utils/errors.js";
import {
  PaginationParams,
  PaginatedResult,
  paginate,
  getPaginationOffset,
} from "../../utils/pagination.js";

export type { Task, NewTask } from "./schema.js";

export const getTasks = async (
  params: PaginationParams
): Promise<PaginatedResult<Task>> => {
  const offset = getPaginationOffset(params.page, params.limit);

  const [items, countResult] = await Promise.all([
    db.select().from(task).limit(params.limit).offset(offset),
    db.select({ count: count() }).from(task),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return paginate(items, total, params);
};

export const getTaskById = async (id: string): Promise<Task> => {
  const [result] = await db.select().from(task).where(eq(task.id, id)).limit(1);

  if (!result) {
    throw NotFoundError("Task not found", "TASK_NOT_FOUND");
  }

  return result;
};

export const createTask = async (data: NewTask): Promise<Task> => {
  const [result] = await db.insert(task).values(data).returning();
  return result;
};

export const updateTask = async (
  id: string,
  data: Partial<NewTask>
): Promise<Task> => {
  const [result] = await db
    .update(task)
    .set(data)
    .where(eq(task.id, id))
    .returning();

  if (!result) {
    throw NotFoundError("Task not found", "TASK_NOT_FOUND");
  }

  return result;
};

export const deleteTask = async (id: string): Promise<void> => {
  const [result] = await db.delete(task).where(eq(task.id, id)).returning();

  if (!result) {
    throw NotFoundError("Task not found", "TASK_NOT_FOUND");
  }
};
