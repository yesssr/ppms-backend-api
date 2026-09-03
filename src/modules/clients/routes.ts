import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  clientPaginationQuery,
  clientParams,
  clientBody,
} from "./validation.js";
import { responses } from "../../docs/openapi.js";

export const clientRoutes = new Elysia({ name: "clients", prefix: "/api/clients" })
  .get("/", ctrl.listClients, {
    query: clientPaginationQuery,
    response: responses.clientList,
    detail: {
      tags: ["Clients"],
      summary: "List clients",
      description: "Returns a paginated list of clients. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .get("/:id", ctrl.getClient, {
    params: clientParams,
    response: responses.client,
    detail: {
      tags: ["Clients"],
      summary: "Get a client by ID",
      description: "Returns a single client. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .post("/", ctrl.createClient, {
    body: clientBody,
    response: responses.client,
    detail: {
      tags: ["Clients"],
      summary: "Create a client",
      description: "Creates a new client. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .put("/:id", ctrl.updateClient, {
    params: clientParams,
    body: t.Partial(clientBody),
    response: responses.client,
    detail: {
      tags: ["Clients"],
      summary: "Update a client",
      description: "Updates an existing client. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .delete("/:id", ctrl.deleteClient, {
    params: clientParams,
    response: responses.deleted,
    detail: {
      tags: ["Clients"],
      summary: "Delete a client",
      description: "Deletes a client. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  });
