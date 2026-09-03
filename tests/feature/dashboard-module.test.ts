import { describe, test, expect } from "bun:test";

describe("Dashboard module smoke test", () => {
  test("dashboard schema exports types", async () => {
    const schema = await import("../../src/modules/dashboard/schema.js");
    expect(schema).toBeDefined();
  });

  test("dashboard service exports getDashboard", async () => {
    const service = await import("../../src/modules/dashboard/service.js");
    expect(service.getDashboard).toBeDefined();
  });

  test("dashboard controller exports handler", async () => {
    const controller = await import("../../src/modules/dashboard/controller.js");
    expect(controller.getDashboardData).toBeDefined();
  });

  test("dashboard routes are registered", async () => {
    const { dashboardRoutes } = await import("../../src/modules/dashboard/routes.js");
    expect(dashboardRoutes).toBeDefined();
  });
});
