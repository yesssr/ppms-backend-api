import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  projectPaginationQuery,
  projectParams,
  projectBody,
  updateProjectBody,
} from "./validation.js";

export const projectRoutes = new Elysia({ name: "projects" })
  .get("/", ctrl.listProjects, { query: projectPaginationQuery })
  .get("/:id", ctrl.getProject, { params: projectParams })
  .post("/", ctrl.createProject, { body: projectBody })
  .put("/:id", ctrl.updateProject, {
    params: projectParams,
    body: updateProjectBody,
  })
  .delete("/:id", ctrl.deleteProject, { params: projectParams });
