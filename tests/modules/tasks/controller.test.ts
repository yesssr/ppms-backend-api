import { describe, test, expect, mock, beforeEach } from "bun:test";

const mockGetTasks = mock(() => Promise.resolve({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } }));
const mockGetTaskById = mock(() => Promise.resolve({ id: "t1", title: "Task" }));
const mockCreateTaskSvc = mock(() => Promise.resolve({ id: "t1" }));
const mockUpdateTaskSvc = mock(() => Promise.resolve({ id: "t1" }));
const mockDeleteTaskSvc = mock(() => Promise.resolve());

mock.module("../../../src/modules/tasks/service.js", () => ({
  getTasks: mockGetTasks,
  getTaskById: mockGetTaskById,
  createTask: mockCreateTaskSvc,
  updateTask: mockUpdateTaskSvc,
  deleteTask: mockDeleteTaskSvc,
}));

const ctrl = await import("../../../src/modules/tasks/controller");

beforeEach(() => {
  mockGetTasks.mockClear();
  mockGetTaskById.mockClear();
  mockCreateTaskSvc.mockClear();
  mockUpdateTaskSvc.mockClear();
  mockDeleteTaskSvc.mockClear();
});

describe("listTasks", () => {
  test("returns success", async () => {
    const result = await ctrl.listTasks({ query: { page: 1, limit: 10 } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns error on failure", async () => {
    mockGetTasks.mockRejectedValueOnce(new Error("db error"));
    const result = await ctrl.listTasks({ query: { page: 1, limit: 10 } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("getTask", () => {
  test("returns success when found", async () => {
    const result = await ctrl.getTask({ params: { id: "t1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockGetTaskById.mockRejectedValueOnce(new Error("Task not found"));
    const result = await ctrl.getTask({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("createTask", () => {
  test("creates task", async () => {
    const result = await ctrl.createTask({ body: { title: "T", projectId: "p1", status: "todo" } as any });
    expect(result).toHaveProperty("success", true);
  });
});

describe("updateTask", () => {
  test("updates task", async () => {
    const result = await ctrl.updateTask({ params: { id: "t1" }, body: { title: "U" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockUpdateTaskSvc.mockRejectedValueOnce(new Error("Task not found"));
    const result = await ctrl.updateTask({ params: { id: "missing" }, body: {} });
    expect(result).toHaveProperty("success", false);
  });
});

describe("deleteTask", () => {
  test("deletes successfully", async () => {
    const result = await ctrl.deleteTask({ params: { id: "t1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockDeleteTaskSvc.mockRejectedValueOnce(new Error("Task not found"));
    const result = await ctrl.deleteTask({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});
