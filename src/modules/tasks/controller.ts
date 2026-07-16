import { success, successWithMeta, error } from "../../utils/response.js";
import {
  getTasks,
  getTaskById,
  createTask as createTaskSvc,
  updateTask as updateTaskSvc,
  deleteTask as deleteTaskSvc,
} from "./service.js";
import { getPaginationParams } from "../../utils/pagination.js";
import type {
  TaskPaginationQuery,
  TaskParams,
  TaskBody,
  UpdateTaskBody,
} from "./validation.js";

export async function listTasks(context: { query: TaskPaginationQuery }) {
  try {
    const { page, limit } = getPaginationParams(
      context.query.page,
      context.query.limit
    );
    const result = await getTasks({ page, limit });
    return successWithMeta(result.data, result.meta, "Tasks retrieved successfully");
  } catch (err) {
    return error("Failed to retrieve tasks", "FETCH_TASKS_ERROR");
  }
}

export async function getTask(context: { params: TaskParams }) {
  try {
    const task = await getTaskById(context.params.id);
    return success(task, "Task retrieved successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Task not found", "TASK_NOT_FOUND");
    }
    return error("Failed to retrieve task", "FETCH_TASK_ERROR");
  }
}

export async function createTask(context: { body: TaskBody }) {
  try {
    const task = await createTaskSvc(context.body);
    return success(task, "Task created successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Project, assignee, or creator not found", "NOT_FOUND");
    }
    return error("Failed to create task", "CREATE_TASK_ERROR");
  }
}

export async function updateTask(context: {
  params: TaskParams;
  body: UpdateTaskBody;
}) {
  try {
    const task = await updateTaskSvc(context.params.id, context.body);
    return success(task, "Task updated successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Task not found", "TASK_NOT_FOUND");
    }
    return error("Failed to update task", "UPDATE_TASK_ERROR");
  }
}

export async function deleteTask(context: { params: TaskParams }) {
  try {
    await deleteTaskSvc(context.params.id);
    return success(null, "Task deleted successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Task not found", "TASK_NOT_FOUND");
    }
    return error("Failed to delete task", "DELETE_TASK_ERROR");
  }
}
