import { describe, test, expect, mock, beforeEach } from "bun:test";
import { createChain, getSharedMockDb, clearMockDb } from "../../helpers/db-mock.js";

const mockDb = getSharedMockDb();

mock.module("../../../src/db/index.js", () => ({ db: getSharedMockDb() }));

const svc = await import("../../../src/modules/tasks/service");

beforeEach(() => {
  clearMockDb(mockDb);
});

const fakeTask = { id: "t1", title: "Task 1", projectId: "p1", status: "todo" };

describe("getTasks", () => {
  test("returns paginated tasks", async () => {
    mockDb.select
      .mockImplementationOnce(() => createChain([fakeTask]))
      .mockImplementationOnce(() => createChain([{ count: 1 }]));
    const result = await svc.getTasks({ page: 1, limit: 10 });
    expect(result.data).toEqual([fakeTask]);
    expect(result.meta.total).toBe(1);
  });
});

describe("getTaskById", () => {
  test("returns task when found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([fakeTask]));
    const result = await svc.getTaskById("t1");
    expect(result).toEqual(fakeTask);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([]));
    await expect(svc.getTaskById("missing")).rejects.toThrow("Task not found");
  });
});

describe("createTask", () => {
  test("inserts and returns task", async () => {
    mockDb.insert.mockImplementationOnce(() => createChain([fakeTask]));
    const result = await svc.createTask({ title: "Task 1", projectId: "p1", status: "todo" } as any);
    expect(result).toEqual(fakeTask);
  });
});

describe("updateTask", () => {
  test("updates and returns task", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([fakeTask]));
    const result = await svc.updateTask("t1", { title: "Updated" });
    expect(result).toEqual(fakeTask);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([]));
    await expect(svc.updateTask("missing", {})).rejects.toThrow("Task not found");
  });
});

describe("deleteTask", () => {
  test("deletes successfully", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([{ id: "t1" }]));
    await expect(svc.deleteTask("t1")).resolves.toBeUndefined();
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([]));
    await expect(svc.deleteTask("missing")).rejects.toThrow("Task not found");
  });
});
