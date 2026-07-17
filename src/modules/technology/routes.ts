import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  technologyPaginationQuery,
  technologyParams,
  technologyBody,
  technologyUpdateBody,
} from "./validation.js";
import { responses } from "../../docs/openapi.js";

export const technologyRoutes = new Elysia({ name: "technology", prefix: "/api/technologies" })
  .get("/", ctrl.listTechnologies, {
    query: technologyPaginationQuery,
    response: responses.technologyList,
    detail: {
      tags: ["Technologies"],
      summary: "List technologies",
      description: "Returns a paginated list of technologies. **Developer (read).**",
      security: [{ sessionCookie: [] }],
    },
  })
  .get("/:id", ctrl.getTechnology, {
    params: technologyParams,
    response: responses.technology,
    detail: {
      tags: ["Technologies"],
      summary: "Get a technology by ID",
      description: "Returns a single technology. **Developer (read).**",
      security: [{ sessionCookie: [] }],
    },
  })
  .post("/", ctrl.createTechnology, {
    body: technologyBody,
    response: responses.technology,
    detail: {
      tags: ["Technologies"],
      summary: "Create a technology",
      description: "Creates a new technology. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .put("/:id", ctrl.updateTechnology, {
    params: technologyParams,
    body: technologyUpdateBody,
    response: responses.technology,
    detail: {
      tags: ["Technologies"],
      summary: "Update a technology",
      description: "Updates an existing technology. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .delete("/:id", ctrl.deleteTechnology, {
    params: technologyParams,
    response: responses.deleted,
    detail: {
      tags: ["Technologies"],
      summary: "Delete a technology",
      description: "Deletes a technology. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  });
