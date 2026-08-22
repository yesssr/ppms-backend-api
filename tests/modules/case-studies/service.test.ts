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

const svc = await import("../../../src/modules/case-studies/service");

beforeEach(() => {
  mockDb.select.mockClear();
  mockDb.insert.mockClear();
  mockDb.update.mockClear();
  mockDb.delete.mockClear();
});

const fakeCaseStudy = { id: "cs1", title: "Case Study 1", slug: "case-study-1", status: "draft" };

describe("getCaseStudies", () => {
  test("returns paginated case studies", async () => {
    mockDb.select
      .mockImplementationOnce(() => createChain([fakeCaseStudy]))
      .mockImplementationOnce(() => createChain([{ count: 1 }]));
    const result = await svc.getCaseStudies({ page: 1, limit: 10 });
    expect(result.data).toEqual([fakeCaseStudy]);
    expect(result.meta.total).toBe(1);
  });
});

describe("getCaseStudyById", () => {
  test("returns case study when found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([fakeCaseStudy]));
    const result = await svc.getCaseStudyById("cs1");
    expect(result).toEqual(fakeCaseStudy);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([]));
    await expect(svc.getCaseStudyById("missing")).rejects.toThrow("Case study not found");
  });
});

describe("createCaseStudy", () => {
  test("inserts and returns case study", async () => {
    mockDb.insert.mockImplementationOnce(() => createChain([fakeCaseStudy]));
    const result = await svc.createCaseStudy({ title: "CS", slug: "cs" } as any);
    expect(result).toEqual(fakeCaseStudy);
  });
});

describe("updateCaseStudy", () => {
  test("updates and returns case study", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([fakeCaseStudy]));
    const result = await svc.updateCaseStudy("cs1", { title: "Updated" });
    expect(result).toEqual(fakeCaseStudy);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([]));
    await expect(svc.updateCaseStudy("missing", {})).rejects.toThrow("Case study not found");
  });
});

describe("deleteCaseStudy", () => {
  test("deletes successfully", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([{ id: "cs1" }]));
    await expect(svc.deleteCaseStudy("cs1")).resolves.toBeUndefined();
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([]));
    await expect(svc.deleteCaseStudy("missing")).rejects.toThrow("Case study not found");
  });
});
