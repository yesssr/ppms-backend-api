import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import { dashboardQuery } from "./validation.js";
import { responses } from "../../docs/openapi.js";

export const dashboardRoutes = new Elysia({ name: "dashboard", prefix: "/api/dashboard" })
  .get("/", ctrl.getDashboardData, {
    query: dashboardQuery,
    response: responses.dashboard,
    detail: {
      tags: ["Dashboard"],
      summary: "Get dashboard analytics",
      description: "Returns aggregated dashboard metrics. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  });
