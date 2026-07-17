import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  servicePaginationQuery,
  serviceParams,
  serviceBody,
} from "./validation.js";
import { responses } from "../../docs/openapi.js";

export const serviceRoutes = new Elysia({ name: "services", prefix: "/api/services" })
  .get("/", ctrl.listServices, {
    query: servicePaginationQuery,
    response: responses.serviceList,
    detail: {
      tags: ["Services"],
      summary: "List services",
      description: "Returns a paginated list of services (project categories). **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .get("/:id", ctrl.getService, {
    params: serviceParams,
    response: responses.service,
    detail: {
      tags: ["Services"],
      summary: "Get a service by ID",
      description: "Returns a single service. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .post("/", ctrl.createService, {
    body: serviceBody,
    response: responses.service,
    detail: {
      tags: ["Services"],
      summary: "Create a service",
      description: "Creates a new service. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .put("/:id", ctrl.updateService, {
    params: serviceParams,
    body: t.Partial(serviceBody),
    response: responses.service,
    detail: {
      tags: ["Services"],
      summary: "Update a service",
      description: "Updates an existing service. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .delete("/:id", ctrl.deleteService, {
    params: serviceParams,
    response: responses.deleted,
    detail: {
      tags: ["Services"],
      summary: "Delete a service",
      description: "Deletes a service. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  });
