import { describe, test, expect, mock, beforeEach } from "bun:test";

const mockGetTechnologies = mock(() => Promise.resolve({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } }));
const mockGetTechnologyById = mock(() => Promise.resolve({ id: "t1", name: "React", category: "frontend" }));
const mockCreateTechnologySvc = mock(() => Promise.resolve({ id: "t1" }));
const mockUpdateTechnologySvc = mock(() => Promise.resolve({ id: "t1" }));
const mockDeleteTechnologySvc = mock(() => Promise.resolve());

mock.module("../../../src/modules/technology/service.js", () => ({
  getTechnologies: mockGetTechnologies,
  getTechnologyById: mockGetTechnologyById,
  createTechnology: mockCreateTechnologySvc,
  updateTechnology: mockUpdateTechnologySvc,
  deleteTechnology: mockDeleteTechnologySvc,
}));

const ctrl = await import("../../../src/modules/technology/controller");

beforeEach(() => {
  mockGetTechnologies.mockClear();
  mockGetTechnologyById.mockClear();
  mockCreateTechnologySvc.mockClear();
  mockUpdateTechnologySvc.mockClear();
  mockDeleteTechnologySvc.mockClear();
});

describe("listTechnologies", () => {
  test("returns success", async () => {
    const result = await ctrl.listTechnologies({ query: { page: 1, limit: 10 } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns error on failure", async () => {
    mockGetTechnologies.mockRejectedValueOnce(new Error("db error"));
    const result = await ctrl.listTechnologies({ query: { page: 1, limit: 10 } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("getTechnology", () => {
  test("returns success when found", async () => {
    const result = await ctrl.getTechnology({ params: { id: "t1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockGetTechnologyById.mockRejectedValueOnce(new Error("Technology not found"));
    const result = await ctrl.getTechnology({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("createTechnology", () => {
  test("creates with valid category", async () => {
    const result = await ctrl.createTechnology({ body: { name: "React", category: "frontend" } as any });
    expect(result).toHaveProperty("success", true);
  });

  test("rejects invalid category", async () => {
    const result = await ctrl.createTechnology({ body: { name: "X", category: "invalid" } as any });
    expect(result).toHaveProperty("success", false);
  });
});

describe("updateTechnology", () => {
  test("updates technology", async () => {
    const result = await ctrl.updateTechnology({ params: { id: "t1" }, body: { name: "React 18" } as any });
    expect(result).toHaveProperty("success", true);
  });

  test("rejects invalid category on update", async () => {
    const result = await ctrl.updateTechnology({ params: { id: "t1" }, body: { category: "bad" } as any });
    expect(result).toHaveProperty("success", false);
  });

  test("returns not-found error", async () => {
    mockUpdateTechnologySvc.mockRejectedValueOnce(new Error("Technology not found"));
    const result = await ctrl.updateTechnology({ params: { id: "missing" }, body: {} });
    expect(result).toHaveProperty("success", false);
  });
});

describe("deleteTechnology", () => {
  test("deletes successfully", async () => {
    const result = await ctrl.deleteTechnology({ params: { id: "t1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockDeleteTechnologySvc.mockRejectedValueOnce(new Error("Technology not found"));
    const result = await ctrl.deleteTechnology({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});
