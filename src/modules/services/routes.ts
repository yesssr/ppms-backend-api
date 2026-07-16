import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  servicePaginationQuery,
  serviceParams,
  serviceBody,
} from "./validation.js";

export const serviceRoutes = new Elysia({ name: "services" })
  .get("/", ctrl.listServices, { query: servicePaginationQuery })
  .get("/:id", ctrl.getService, { params: serviceParams })
  .post("/", ctrl.createService, { body: serviceBody })
  .put("/:id", ctrl.updateService, {
    params: serviceParams,
    body: t.Partial(serviceBody),
  })
  .delete("/:id", ctrl.deleteService, { params: serviceParams });
