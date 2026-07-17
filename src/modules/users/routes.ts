import { Elysia } from "elysia";
import * as ctrl from "./controller.js";
import {
  userPaginationQuery,
  userParams,
  createUserBody,
  updateUserBody,
} from "./validation.js";
import { responses } from "../../docs/openapi.js";

export const userRoutes = new Elysia({ name: "users", prefix: "/api/users" })
  .get("/", ctrl.listUsers, {
    query: userPaginationQuery,
    response: responses.userList,
    detail: {
      tags: ["Users"],
      summary: "List users",
      description:
        "Returns a paginated list of internal employees. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .get("/:id", ctrl.getUser, {
    params: userParams,
    response: responses.user,
    detail: {
      tags: ["Users"],
      summary: "Get a user by ID",
      description: "Returns a single user. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .post("/", ctrl.createUser, {
    body: createUserBody,
    response: responses.user,
    detail: {
      tags: ["Users"],
      summary: "Create a user",
      description:
        "Creates a user via Better Auth signup then assigns department/role/teams in one request. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .put("/:id", ctrl.updateUser, {
    params: userParams,
    body: updateUserBody,
    response: responses.user,
    detail: {
      tags: ["Users"],
      summary: "Update a user",
      description: "Updates an existing user. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .delete("/:id", ctrl.deleteUser, {
    params: userParams,
    response: responses.deleted,
    detail: {
      tags: ["Users"],
      summary: "Delete a user",
      description: "Deletes a user. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  });
