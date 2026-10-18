import { describe, test, expect, mock, beforeEach } from "bun:test";
import { createChain, getSharedMockDb, clearMockDb } from "../../helpers/db-mock.js";

const mockDb = getSharedMockDb();

mock.module("../../../src/db/index.js", () => ({ db: getSharedMockDb() }));

const mockStorageService = {
  generateSignedUrl: mock(() => Promise.resolve("https://signed.url")),
  upload: mock(() => Promise.resolve("https://cdn.url/key")),
  delete: mock(() => Promise.resolve()),
  getPublicUrl: mock((key: string) => `https://cdn.url/${key}`),
  generateKey: mock((prefix: string, name: string) => `${prefix}/${name}`),
};

mock.module("../../../src/utils/storage.js", () => ({
  storageService: mockStorageService,
}));

const svc = await import("../../../src/modules/documents/service");

beforeEach(() => {
  clearMockDb(mockDb);
  mockStorageService.generateSignedUrl.mockClear();
});

const fakeDoc = { id: "d1", projectId: "p1", fileName: "doc.pdf", fileKey: "docs/doc.pdf", mimeType: "application/pdf", fileSize: 1024 };

describe("getDocuments", () => {
  test("returns paginated documents", async () => {
    mockDb.select
      .mockImplementationOnce(() => createChain([fakeDoc]))
      .mockImplementationOnce(() => createChain([{ count: 1 }]));
    const result = await svc.getDocuments({ page: 1, limit: 10 });
    expect(result.meta.total).toBe(1);
  });
});

describe("getDocumentById", () => {
  test("returns document when found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([fakeDoc]));
    const result = await svc.getDocumentById("d1");
    expect(result).toEqual(fakeDoc);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([]));
    await expect(svc.getDocumentById("missing")).rejects.toThrow("Document not found");
  });
});

describe("getDocumentDownload", () => {
  test("returns signed URL", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([{ fileKey: "docs/doc.pdf" }]));
    const result = await svc.getDocumentDownload("d1");
    expect(result).toHaveProperty("downloadUrl");
    expect(mockStorageService.generateSignedUrl).toHaveBeenCalledWith("docs/doc.pdf", 300);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([]));
    await expect(svc.getDocumentDownload("missing")).rejects.toThrow("Document not found");
  });
});

describe("createDocument", () => {
  test("inserts and returns document", async () => {
    mockDb.insert.mockImplementationOnce(() => createChain([fakeDoc]));
    const result = await svc.createDocument({} as any);
    expect(result).toEqual(fakeDoc);
  });
});

describe("updateDocument", () => {
  test("updates and returns document", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([fakeDoc]));
    const result = await svc.updateDocument("d1", { fileName: "new.pdf" });
    expect(result).toEqual(fakeDoc);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([]));
    await expect(svc.updateDocument("missing", {})).rejects.toThrow("Document not found");
  });
});

describe("deleteDocument", () => {
  test("deletes successfully", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([{ id: "d1" }]));
    await expect(svc.deleteDocument("d1")).resolves.toBeUndefined();
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([]));
    await expect(svc.deleteDocument("missing")).rejects.toThrow("Document not found");
  });
});
