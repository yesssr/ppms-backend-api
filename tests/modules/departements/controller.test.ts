import { describe, test, expect, mock, beforeEach } from "bun:test";

const mockGetDepartments = mock(() => Promise.resolve({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } }));
const mockGetDepartmentById = mock(() => Promise.resolve({ id: "d1", name: "Eng" }));
const mockCreateDepartmentSvc = mock(() => Promise.resolve({ id: "d1" }));
const mockUpdateDepartmentSvc = mock(() => Promise.resolve({ id: "d1" }));
const mockDeleteDepartmentSvc = mock(() => Promise.resolve());

mock.module("../../../src/modules/departements/service.js", () => ({
  getDepartments: mockGetDepartments,
  getDepartmentById: mockGetDepartmentById,
  createDepartment: mockCreateDepartmentSvc,
  updateDepartment: mockUpdateDepartmentSvc,
  deleteDepartment: mockDeleteDepartmentSvc,
}));

const ctrl = await import("../../../src/modules/departements/controller");

beforeEach(() => {
  mockGetDepartments.mockClear();
  mockGetDepartmentById.mockClear();
  mockCreateDepartmentSvc.mockClear();
  mockUpdateDepartmentSvc.mockClear();
  mockDeleteDepartmentSvc.mockClear();
});

describe("listDepartments", () => {
  test("returns success", async () => {
    const result = await ctrl.listDepartments({ query: { page: 1, limit: 10 } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns error on failure", async () => {
    mockGetDepartments.mockRejectedValueOnce(new Error("db error"));
    const result = await ctrl.listDepartments({ query: { page: 1, limit: 10 } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("getDepartment", () => {
  test("returns success when found", async () => {
    const result = await ctrl.getDepartment({ params: { id: "d1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockGetDepartmentById.mockRejectedValueOnce(new Error("Department not found"));
    const result = await ctrl.getDepartment({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("createDepartment", () => {
  test("creates department", async () => {
    const result = await ctrl.createDepartment({ body: { name: "Eng" } as any });
    expect(result).toHaveProperty("success", true);
  });
});

describe("updateDepartment", () => {
  test("updates department", async () => {
    const result = await ctrl.updateDepartment({ params: { id: "d1" }, body: { name: "U" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockUpdateDepartmentSvc.mockRejectedValueOnce(new Error("Department not found"));
    const result = await ctrl.updateDepartment({ params: { id: "missing" }, body: {} });
    expect(result).toHaveProperty("success", false);
  });
});

describe("deleteDepartment", () => {
  test("deletes successfully", async () => {
    const result = await ctrl.deleteDepartment({ params: { id: "d1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockDeleteDepartmentSvc.mockRejectedValueOnce(new Error("Department not found"));
    const result = await ctrl.deleteDepartment({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});
