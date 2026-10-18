import { describe, test, expect, mock } from "bun:test";
import { Elysia } from "elysia";

const fullDept = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Eng",
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

mock.module("../../src/modules/departements/service.js", () => ({
  getDepartments: mock(() =>
    Promise.resolve({
      data: [fullDept],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    })
  ),
  getDepartmentById: mock(() => Promise.resolve(fullDept)),
  createDepartment: mock(() => Promise.resolve(fullDept)),
  updateDepartment: mock(() => Promise.resolve(fullDept)),
  deleteDepartment: mock(() => Promise.resolve()),
}));

const { departmentRoutes } = await import(
  "../../src/modules/departements/routes.js"
);

const buildApp = () => {
  const app = new Elysia()
    .get("/health", () => ({ status: "ok" }))
    .use(departmentRoutes);
  return app;
};

describe("health", () => {
  test("GET /health returns ok", async () => {
    const app = buildApp();
    const res = await app.handle(new Request("http://localhost/health"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });
});

describe("departments routes validation", () => {
  test("POST rejects missing name with 422", async () => {
    const app = buildApp();
    const res = await app.handle(
      new Request("http://localhost/api/departments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(422);
  });

  test("POST accepts valid body with 200", async () => {
    const app = buildApp();
    const res = await app.handle(
      new Request("http://localhost/api/departments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Eng" }),
      })
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
  });

  test("GET rejects non-uuid id with 422", async () => {
    const app = buildApp();
    const res = await app.handle(
      new Request("http://localhost/api/departments/not-a-uuid")
    );
    expect(res.status).toBe(422);
  });
});
