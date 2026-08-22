import { describe, test, expect, mock, beforeEach } from "bun:test";

const mockGetServices = mock(() => Promise.resolve({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } }));
const mockGetServiceById = mock(() => Promise.resolve({ id: "s1", name: "Web" }));
const mockCreateServiceSvc = mock(() => Promise.resolve({ id: "s1" }));
const mockUpdateServiceSvc = mock(() => Promise.resolve({ id: "s1" }));
const mockDeleteServiceSvc = mock(() => Promise.resolve());

mock.module("../../../src/modules/services/service.js", () => ({
  getServices: mockGetServices,
  getServiceById: mockGetServiceById,
  createService: mockCreateServiceSvc,
  updateService: mockUpdateServiceSvc,
  deleteService: mockDeleteServiceSvc,
}));

const ctrl = await import("../../../src/modules/services/controller");

beforeEach(() => {
  mockGetServices.mockClear();
  mockGetServiceById.mockClear();
  mockCreateServiceSvc.mockClear();
  mockUpdateServiceSvc.mockClear();
  mockDeleteServiceSvc.mockClear();
});

describe("listServices", () => {
  test("returns success", async () => {
    const result = await ctrl.listServices({ query: { page: 1, limit: 10 } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns error on failure", async () => {
    mockGetServices.mockRejectedValueOnce(new Error("db error"));
    const result = await ctrl.listServices({ query: { page: 1, limit: 10 } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("getService", () => {
  test("returns success when found", async () => {
    const result = await ctrl.getService({ params: { id: "s1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockGetServiceById.mockRejectedValueOnce(new Error("Service not found"));
    const result = await ctrl.getService({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("createService", () => {
  test("creates service", async () => {
    const result = await ctrl.createService({ body: { name: "Web" } as any });
    expect(result).toHaveProperty("success", true);
  });
});

describe("updateService", () => {
  test("updates service", async () => {
    const result = await ctrl.updateService({ params: { id: "s1" }, body: { name: "U" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockUpdateServiceSvc.mockRejectedValueOnce(new Error("Service not found"));
    const result = await ctrl.updateService({ params: { id: "missing" }, body: {} });
    expect(result).toHaveProperty("success", false);
  });
});

describe("deleteService", () => {
  test("deletes successfully", async () => {
    const result = await ctrl.deleteService({ params: { id: "s1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockDeleteServiceSvc.mockRejectedValueOnce(new Error("Service not found"));
    const result = await ctrl.deleteService({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});
