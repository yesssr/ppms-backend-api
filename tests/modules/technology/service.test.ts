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

const svc = await import("../../../src/modules/technology/service");

beforeEach(() => {
  mockDb.select.mockClear();
  mockDb.insert.mockClear();
  mockDb.update.mockClear();
  mockDb.delete.mockClear();
});

const fakeTech = { id: "t1", name: "React", category: "frontend" };

describe("getTechnologies", () => {
  test("returns paginated technologies", async () => {
    mockDb.select
      .mockImplementationOnce(() => createChain([fakeTech]))
      .mockImplementationOnce(() => createChain([{ count: 1 }]));
    const result = await svc.getTechnologies({ page: 1, limit: 10 });
    expect(result.data).toEqual([fakeTech]);
    expect(result.meta.total).toBe(1);
  });
});

describe("getTechnologyById", () => {
  test("returns technology when found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([fakeTech]));
    const result = await svc.getTechnologyById("t1");
    expect(result).toEqual(fakeTech);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([]));
    await expect(svc.getTechnologyById("missing")).rejects.toThrow("Technology not found");
  });
});

describe("createTechnology", () => {
  test("inserts and returns technology", async () => {
    mockDb.insert.mockImplementationOnce(() => createChain([fakeTech]));
    const result = await svc.createTechnology({ name: "React", category: "frontend" } as any);
    expect(result).toEqual(fakeTech);
  });
});

describe("updateTechnology", () => {
  test("updates and returns technology", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([fakeTech]));
    const result = await svc.updateTechnology("t1", { name: "React 18" });
    expect(result).toEqual(fakeTech);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([]));
    await expect(svc.updateTechnology("missing", {})).rejects.toThrow("Technology not found");
  });
});

describe("deleteTechnology", () => {
  test("deletes successfully", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([{ id: "t1" }]));
    await expect(svc.deleteTechnology("t1")).resolves.toBeUndefined();
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([]));
    await expect(svc.deleteTechnology("missing")).rejects.toThrow("Technology not found");
  });
});
