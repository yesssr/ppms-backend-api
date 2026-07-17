import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  taskPaginationQuery,
  taskParams,
  taskBody,
  updateTaskBody,
} from "./validation.js";
import { responses } from "../../docs/openapi.js";

export const taskRoutes = new Elysia({ name: "tasks", prefix: "/api/tasks" })
  .get("/", ctrl.listTasks, {
    query: taskPaginationQuery,
    response: responses.taskList,
    detail: {
      tags: ["Tasks"],
      summary: "List tasks",
      description: "Returns a paginated list of tasks. **Developer.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .get("/:id", ctrl.getTask, {
    params: taskParams,
    response: responses.task,
    detail: {
      tags: ["Tasks"],
      summary: "Get a task by ID",
      description: "Returns a single task. **Developer.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .post("/", ctrl.createTask, {
    body: taskBody,
    response: responses.task,
    detail: {
      tags: ["Tasks"],
      summary: "Create a task",
      description: "Creates a new task. **Developer.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .put("/:id", ctrl.updateTask, {
    params: taskParams,
    body: updateTaskBody,
    response: responses.task,
    detail: {
      tags: ["Tasks"],
      summary: "Update a task",
      description: "Updates an existing task. **Developer.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .delete("/:id", ctrl.deleteTask, {
    params: taskParams,
    response: responses.deleted,
    detail: {
      tags: ["Tasks"],
      summary: "Delete a task",
      description: "Deletes a task. **Developer.**",
      security: [{ sessionCookie: [] }],
    },
  });
