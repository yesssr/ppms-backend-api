import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  projectPaginationQuery,
  projectParams,
  projectBody,
  updateProjectBody,
  updateProjectProgressBody,
} from "./validation.js";
import { responses } from "../../docs/openapi.js";

export const projectRoutes = new Elysia({ name: "projects", prefix: "/api/projects" })
  // Public tracking endpoint (resi-style) for clients — no auth required.
  .get("/track/:code", ctrl.trackProject, {
    params: t.Object({ code: t.String() }),
    response: t.Object({
      success: t.Boolean(),
      data: t.Object({
        name: t.String(),
        clientName: t.String(),
        status: t.String(),
        progressPercentage: t.Number(),
        lastChange: t.Date(),
        logs: t.Array(
          t.Object({
            id: t.String({ format: "uuid" }),
            projectId: t.String({ format: "uuid" }),
            progressPercentage: t.Number(),
            message: t.Union([t.String(), t.Null()]),
            updatedBy: t.Union([t.String(), t.Null()]),
            createdAt: t.Date(),
          })
        ),
      }),
      message: t.String(),
      error: t.Any(),
      meta: t.Optional(t.Any()),
    }) as any,
    detail: {
      tags: ["Tracking"],
      summary: "Track project progress (public)",
      description:
        "Public, unauthenticated progress tracking for clients using the project's unique `code` (like checking a delivery resi). Returns project info and the full progress log timeline. No internal documents, repository URLs, or user data are exposed.",
      security: [],
    },
  })
  .get("/", ctrl.listProjects, {
    query: projectPaginationQuery,
    response: responses.projectList,
    detail: {
      tags: ["Projects"],
      summary: "List projects",
      description: "Returns a paginated list of projects. **Developer (read).**",
      security: [{ sessionCookie: [] }],
    },
  })
  .get("/:id", ctrl.getProject, {
    params: projectParams,
    response: responses.project,
    detail: {
      tags: ["Projects"],
      summary: "Get a project by ID",
      description: "Returns a single project. **Developer (read).**",
      security: [{ sessionCookie: [] }],
    },
  })
  .get("/:id/logs", ctrl.getProjectLogs, {
    params: projectParams,
    response: responses.projectLogList,
    detail: {
      tags: ["Projects"],
      summary: "Get project progress logs",
      description:
        "Returns the full resi-style progress history for a project. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .post("/", ctrl.createProject, {
    body: projectBody,
    response: responses.project,
    detail: {
      tags: ["Projects"],
      summary: "Create a project",
      description:
        "Creates a project. A unique tracking `code` is auto-generated. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .put("/:id", ctrl.updateProject, {
    params: projectParams,
    body: updateProjectBody,
    response: responses.project,
    detail: {
      tags: ["Projects"],
      summary: "Update a project",
      description: "Updates an existing project. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .put("/:id/progress", ctrl.updateProjectProgress, {
    params: projectParams,
    body: updateProjectProgressBody,
    response: responses.project,
    detail: {
      tags: ["Projects"],
      summary: "Update project progress",
      description:
        "Developer updates the project's progress percentage. Updates `progressPercentage` + `lastChange` and appends a `project_log` entry (resi-style history). **Developer.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .delete("/:id", ctrl.deleteProject, {
    params: projectParams,
    response: responses.deleted,
    detail: {
      tags: ["Projects"],
      summary: "Delete a project",
      description: "Deletes a project. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  });
