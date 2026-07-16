import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  userPaginationQuery,
  userParams,
  createUserBody,
  updateUserBody,
} from "./validation.js";

export const userRoutes = new Elysia({ name: "users" })
  .get("/", ctrl.listUsers, { query: userPaginationQuery })
  .get("/:id", ctrl.getUser, { params: userParams })
  .post("/", ctrl.createUser, { body: createUserBody })
  .put("/:id", ctrl.updateUser, {
    params: userParams,
    body: updateUserBody,
  })
  .delete("/:id", ctrl.deleteUser, { params: userParams });
