import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  departmentPaginationQuery,
  departmentParams,
  departmentBody,
} from "./validation.js";
import { responses } from "../../docs/openapi.js";

export const departmentRoutes = new Elysia({ name: "departments", prefix: "/api/departments" })
  .get("/", ctrl.listDepartments, {
    query: departmentPaginationQuery,
    response: responses.departmentList,
    detail: {
      tags: ["Departments"],
      summary: "List departments",
      description: "Returns a paginated list of departments. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .get("/:id", ctrl.getDepartment, {
    params: departmentParams,
    response: responses.department,
    detail: {
      tags: ["Departments"],
      summary: "Get a department by ID",
      description: "Returns a single department. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .post("/", ctrl.createDepartment, {
    body: departmentBody,
    response: responses.department,
    detail: {
      tags: ["Departments"],
      summary: "Create a department",
      description: "Creates a new department. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .put("/:id", ctrl.updateDepartment, {
    params: departmentParams,
    body: t.Partial(departmentBody),
    response: responses.department,
    detail: {
      tags: ["Departments"],
      summary: "Update a department",
      description: "Updates an existing department. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .delete("/:id", ctrl.deleteDepartment, {
    params: departmentParams,
    response: responses.deleted,
    detail: {
      tags: ["Departments"],
      summary: "Delete a department",
      description: "Deletes a department. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  });
