import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  taskPaginationQuery,
  taskParams,
  taskBody,
  updateTaskBody,
} from "./validation.js";

export const taskRoutes = new Elysia({ name: "tasks" })
  .get("/", ctrl.listTasks, { query: taskPaginationQuery })
  .get("/:id", ctrl.getTask, { params: taskParams })
  .post("/", ctrl.createTask, { body: taskBody })
  .put("/:id", ctrl.updateTask, {
    params: taskParams,
    body: updateTaskBody,
  })
  .delete("/:id", ctrl.deleteTask, { params: taskParams });
