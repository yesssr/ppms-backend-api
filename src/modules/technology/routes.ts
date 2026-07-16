import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  technologyPaginationQuery,
  technologyParams,
  technologyBody,
} from "./validation.js";

export const technologyRoutes = new Elysia({ name: "technology" })
  .get("/", ctrl.listTechnologies, { query: technologyPaginationQuery })
  .get("/:id", ctrl.getTechnology, { params: technologyParams })
  .post("/", ctrl.createTechnology, { body: technologyBody })
  .put("/:id", ctrl.updateTechnology, {
    params: technologyParams,
    body: t.Partial(technologyBody),
  })
  .delete("/:id", ctrl.deleteTechnology, { params: technologyParams });
