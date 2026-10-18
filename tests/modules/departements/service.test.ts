import { describe, test, expect, mock, beforeEach } from "bun:test";
import { createChain, getSharedMockDb, clearMockDb } from "../../helpers/db-mock.js";

const mockDb = getSharedMockDb();

mock.module("../../../src/db/index.js", () => ({ db: getSharedMockDb() }));

const svc = await import("../../../src/modules/departements/service");

beforeEach(() => {
  clearMockDb(mockDb);
});

const fakeDept = { id: "d1", name: "Engineering" };

describe("getDepartments", () => {
  test("returns paginated departments", async () => {
    mockDb.select
      .mockImplementationOnce(() => createChain([fakeDept]))
      .mockImplementationOnce(() => createChain([{ count: 1 }]));
    const result = await svc.getDepartments({ page: 1, limit: 10 });
    expect(result.data).toEqual([fakeDept]);
    expect(result.meta.total).toBe(1);
  });
});

describe("getDepartmentById", () => {
  test("returns department when found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([fakeDept]));
    const result = await svc.getDepartmentById("d1");
    expect(result).toEqual(fakeDept);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([]));
    await expect(svc.getDepartmentById("missing")).rejects.toThrow("Department not found");
  });
});

describe("createDepartment", () => {
  test("inserts and returns department", async () => {
    mockDb.insert.mockImplementationOnce(() => createChain([fakeDept]));
    const result = await svc.createDepartment({ name: "Engineering" } as any);
    expect(result).toEqual(fakeDept);
  });
});

describe("updateDepartment", () => {
  test("updates and returns department", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([fakeDept]));
    const result = await svc.updateDepartment("d1", { name: "Updated" });
    expect(result).toEqual(fakeDept);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([]));
    await expect(svc.updateDepartment("missing", {})).rejects.toThrow("Department not found");
  });
});

describe("deleteDepartment", () => {
  test("deletes and returns department", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([fakeDept]));
    const result = await svc.deleteDepartment("d1");
    expect(result).toEqual(fakeDept);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([]));
    await expect(svc.deleteDepartment("missing")).rejects.toThrow("Department not found");
  });
});
