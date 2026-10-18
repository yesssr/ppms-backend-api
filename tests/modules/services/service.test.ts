import { describe, test, expect, mock, beforeEach } from "bun:test";
import { createChain, getSharedMockDb, clearMockDb } from "../../helpers/db-mock.js";

const mockDb = getSharedMockDb();

mock.module("../../../src/db/index.js", () => ({ db: getSharedMockDb() }));

const svc = await import("../../../src/modules/services/service");

beforeEach(() => {
  clearMockDb(mockDb);
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
