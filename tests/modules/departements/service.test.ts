import { describe, test, expect, mock, beforeEach } from "bun:test";

function createChain(result: unknown[] = []) {
  const makeChain = (r: unknown[]) => {
    const c: Record<string, unknown> = {};
    c.select = () => makeChain(r);
    c.from = () => makeChain(r);
    c.where = () => makeChain(r);
    c.limit = () => makeChain(r);
    c.offset = () => makeChain(r);
    c.orderBy = () => makeChain(r);
    c.innerJoin = () => makeChain(r);
    c.set = () => makeChain(r);
    c.values = () => makeChain(r);
    c.returning = () => makeChain(r);
    c.then = (resolve: (v: unknown) => void) => {
      resolve(r);
    };
    return c;
  };
  return makeChain(result);
}

const mockDb = {
  select: mock(() => createChain([])),
  insert: mock(() => createChain([])),
  update: mock(() => createChain([])),
  delete: mock(() => createChain([])),
};

mock.module("../../../src/db/index.js", () => ({ db: mockDb }));

const svc = await import("../../../src/modules/departements/service");

beforeEach(() => {
  mockDb.select.mockClear();
  mockDb.insert.mockClear();
  mockDb.update.mockClear();
  mockDb.delete.mockClear();
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
