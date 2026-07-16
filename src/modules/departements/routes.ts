import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  departmentPaginationQuery,
  departmentParams,
  departmentBody,
} from "./validation.js";

export const departmentRoutes = new Elysia({ name: "departments" })
  .get("/", ctrl.listDepartments, { query: departmentPaginationQuery })
  .get("/:id", ctrl.getDepartment, { params: departmentParams })
  .post("/", ctrl.createDepartment, { body: departmentBody })
  .put("/:id", ctrl.updateDepartment, {
    params: departmentParams,
    body: t.Partial(departmentBody),
  })
  .delete("/:id", ctrl.deleteDepartment, { params: departmentParams });
