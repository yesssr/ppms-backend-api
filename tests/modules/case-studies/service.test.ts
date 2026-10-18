import { describe, test, expect, mock, beforeEach } from "bun:test";
import { createChain, getSharedMockDb, clearMockDb } from "../../helpers/db-mock.js";

const mockDb = getSharedMockDb();

mock.module("../../../src/db/index.js", () => ({ db: getSharedMockDb() }));

const svc = await import("../../../src/modules/case-studies/service");

beforeEach(() => {
  clearMockDb(mockDb);
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
