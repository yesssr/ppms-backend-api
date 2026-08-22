import { describe, test, expect, mock, beforeEach } from "bun:test";

const mockGetCaseStudies = mock(() => Promise.resolve({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } }));
const mockGetCaseStudyById = mock(() => Promise.resolve({ id: "cs1", title: "CS" }));
const mockCreateCaseStudySvc = mock(() => Promise.resolve({ id: "cs1" }));
const mockUpdateCaseStudySvc = mock(() => Promise.resolve({ id: "cs1" }));
const mockDeleteCaseStudySvc = mock(() => Promise.resolve());

mock.module("../../../src/modules/case-studies/service.js", () => ({
  getCaseStudies: mockGetCaseStudies,
  getCaseStudyById: mockGetCaseStudyById,
  createCaseStudy: mockCreateCaseStudySvc,
  updateCaseStudy: mockUpdateCaseStudySvc,
  deleteCaseStudy: mockDeleteCaseStudySvc,
}));

const mockStorageService = {
  generateKey: mock(() => "case-studies/covers/key.jpg"),
  upload: mock(() => Promise.resolve("https://cdn.url/key.jpg")),
};

mock.module("../../../src/utils/storage.js", () => ({
  storageService: mockStorageService,
}));

const ctrl = await import("../../../src/modules/case-studies/controller");

beforeEach(() => {
  mockGetCaseStudies.mockClear();
  mockGetCaseStudyById.mockClear();
  mockCreateCaseStudySvc.mockClear();
  mockUpdateCaseStudySvc.mockClear();
  mockDeleteCaseStudySvc.mockClear();
  mockStorageService.generateKey.mockClear();
  mockStorageService.upload.mockClear();
});

describe("listCaseStudies", () => {
  test("returns success", async () => {
    const result = await ctrl.listCaseStudies({ query: { page: 1, limit: 10 } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns error on failure", async () => {
    mockGetCaseStudies.mockRejectedValueOnce(new Error("db error"));
    const result = await ctrl.listCaseStudies({ query: { page: 1, limit: 10 } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("getCaseStudy", () => {
  test("returns success when found", async () => {
    const result = await ctrl.getCaseStudy({ params: { id: "cs1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockGetCaseStudyById.mockRejectedValueOnce(new Error("Case study not found"));
    const result = await ctrl.getCaseStudy({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("createCaseStudy", () => {
  test("creates without file", async () => {
    const result = await ctrl.createCaseStudy({
      body: { projectId: "p1", title: "T", slug: "t", challenge: "C", solution: "S", outcome: "O", status: "draft" } as any,
    });
    expect(result).toHaveProperty("success", true);
  });

  test("rejects invalid image type", async () => {
    const file = new File(["x"], "test.txt", { type: "text/plain" });
    Object.defineProperty(file, "size", { value: 100 });
    const result = await ctrl.createCaseStudy({
      body: { projectId: "p1", title: "T", slug: "t", challenge: "C", solution: "S", outcome: "O", status: "draft", coverImageFile: file } as any,
    });
    expect(result).toHaveProperty("success", false);
  });

  test("rejects oversized image", async () => {
    const file = new File(["x"], "big.png", { type: "image/png" });
    Object.defineProperty(file, "size", { value: 20 * 1024 * 1024 });
    const result = await ctrl.createCaseStudy({
      body: { projectId: "p1", title: "T", slug: "t", challenge: "C", solution: "S", outcome: "O", status: "draft", coverImageFile: file } as any,
    });
    expect(result).toHaveProperty("success", false);
  });
});

describe("updateCaseStudy", () => {
  test("updates case study", async () => {
    const result = await ctrl.updateCaseStudy({ params: { id: "cs1" }, body: { title: "U" } as any });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockUpdateCaseStudySvc.mockRejectedValueOnce(new Error("Case study not found"));
    const result = await ctrl.updateCaseStudy({ params: { id: "missing" }, body: {} });
    expect(result).toHaveProperty("success", false);
  });
});

describe("deleteCaseStudy", () => {
  test("deletes successfully", async () => {
    const result = await ctrl.deleteCaseStudy({ params: { id: "cs1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockDeleteCaseStudySvc.mockRejectedValueOnce(new Error("Case study not found"));
    const result = await ctrl.deleteCaseStudy({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});
