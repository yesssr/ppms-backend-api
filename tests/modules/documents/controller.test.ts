import { describe, test, expect, mock, beforeEach } from "bun:test";

const mockGetDocuments = mock(() => Promise.resolve({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } }));
const mockGetDocumentById = mock(() => Promise.resolve({ id: "d1", fileName: "doc.pdf" }));
const mockGetDocumentDownload = mock(() => Promise.resolve({ downloadUrl: "https://signed.url" }));
const mockCreateDocumentSvc = mock(() => Promise.resolve({ id: "d1" }));
const mockUpdateDocumentSvc = mock(() => Promise.resolve({ id: "d1" }));
const mockDeleteDocumentSvc = mock(() => Promise.resolve());

mock.module("../../../src/modules/documents/service.js", () => ({
  getDocuments: mockGetDocuments,
  getDocumentById: mockGetDocumentById,
  getDocumentDownload: mockGetDocumentDownload,
  createDocument: mockCreateDocumentSvc,
  updateDocument: mockUpdateDocumentSvc,
  deleteDocument: mockDeleteDocumentSvc,
}));

const mockStorageService = {
  generateKey: mock(() => "documents/key.pdf"),
  upload: mock(() => Promise.resolve("https://cdn.url/key.pdf")),
  generateSignedUrl: mock(() => Promise.resolve("https://signed.url")),
};

mock.module("../../../src/utils/storage.js", () => ({
  storageService: mockStorageService,
}));

const ctrl = await import("../../../src/modules/documents/controller");

beforeEach(() => {
  mockGetDocuments.mockClear();
  mockGetDocumentById.mockClear();
  mockGetDocumentDownload.mockClear();
  mockCreateDocumentSvc.mockClear();
  mockUpdateDocumentSvc.mockClear();
  mockDeleteDocumentSvc.mockClear();
  mockStorageService.generateKey.mockClear();
  mockStorageService.upload.mockClear();
});

describe("listDocuments", () => {
  test("returns success", async () => {
    const result = await ctrl.listDocuments({ query: { page: 1, limit: 10 } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns error on failure", async () => {
    mockGetDocuments.mockRejectedValueOnce(new Error("db error"));
    const result = await ctrl.listDocuments({ query: { page: 1, limit: 10 } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("getDocument", () => {
  test("returns success when found", async () => {
    const result = await ctrl.getDocument({ params: { id: "d1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockGetDocumentById.mockRejectedValueOnce(new Error("Document not found"));
    const result = await ctrl.getDocument({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("createDocument", () => {
  test("returns FILE_REQUIRED when no file", async () => {
    const result = await ctrl.createDocument({ body: { projectId: "p1" } as any });
    expect(result).toHaveProperty("success", false);
  });

  test("uploads file and creates document", async () => {
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 100 });
    const result = await ctrl.createDocument({ body: { projectId: "p1", file } as any });
    expect(result).toHaveProperty("success", true);
    expect(mockStorageService.generateKey).toHaveBeenCalled();
    expect(mockStorageService.upload).toHaveBeenCalled();
  });
});

describe("updateDocument", () => {
  test("returns FILE_REQUIRED when no file", async () => {
    const result = await ctrl.updateDocument({ params: { id: "d1" }, body: { projectId: "p1" } as any });
    expect(result).toHaveProperty("success", false);
  });

  test("returns not-found error", async () => {
    mockUpdateDocumentSvc.mockRejectedValueOnce(new Error("Document not found"));
    const file = new File(["x"], "f.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 100 });
    const result = await ctrl.updateDocument({ params: { id: "missing" }, body: { file } as any });
    expect(result).toHaveProperty("success", false);
  });
});

describe("deleteDocument", () => {
  test("deletes successfully", async () => {
    const result = await ctrl.deleteDocument({ params: { id: "d1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockDeleteDocumentSvc.mockRejectedValueOnce(new Error("Document not found"));
    const result = await ctrl.deleteDocument({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("downloadDocument", () => {
  test("returns download URL", async () => {
    const result = await ctrl.downloadDocument({ params: { id: "d1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockGetDocumentDownload.mockRejectedValueOnce(new Error("Document not found"));
    const result = await ctrl.downloadDocument({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});
