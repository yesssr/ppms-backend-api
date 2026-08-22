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

const svc = await import("../../../src/modules/services/service");

beforeEach(() => {
  mockDb.select.mockClear();
  mockDb.insert.mockClear();
  mockDb.update.mockClear();
  mockDb.delete.mockClear();
});

const fakeService = { id: "s1", name: "Web Development" };

describe("getServices", () => {
  test("returns paginated services", async () => {
    mockDb.select
      .mockImplementationOnce(() => createChain([fakeService]))
      .mockImplementationOnce(() => createChain([{ count: 1 }]));
    const result = await svc.getServices({ page: 1, limit: 10 });
    expect(result.data).toEqual([fakeService]);
    expect(result.meta.total).toBe(1);
  });
});

describe("getServiceById", () => {
  test("returns service when found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([fakeService]));
    const result = await svc.getServiceById("s1");
    expect(result).toEqual(fakeService);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([]));
    await expect(svc.getServiceById("missing")).rejects.toThrow("Service not found");
  });
});

describe("createService", () => {
  test("inserts and returns service", async () => {
    mockDb.insert.mockImplementationOnce(() => createChain([fakeService]));
    const result = await svc.createService({ name: "Web Dev" } as any);
    expect(result).toEqual(fakeService);
  });
});

describe("updateService", () => {
  test("updates and returns service", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([fakeService]));
    const result = await svc.updateService("s1", { name: "Updated" });
    expect(result).toEqual(fakeService);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([]));
    await expect(svc.updateService("missing", {})).rejects.toThrow("Service not found");
  });
});

describe("deleteService", () => {
  test("deletes successfully", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([{ id: "s1" }]));
    await expect(svc.deleteService("s1")).resolves.toBeUndefined();
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([]));
    await expect(svc.deleteService("missing")).rejects.toThrow("Service not found");
  });
});
