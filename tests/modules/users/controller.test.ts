import { describe, test, expect, mock, beforeEach } from "bun:test";

const mockGetUsers = mock(() => Promise.resolve({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } }));
const mockGetUserById = mock(() => Promise.resolve({ id: "u1", name: "John" }));
const mockCreateUserSvc = mock(() => Promise.resolve({ id: "u1" }));
const mockUpdateUserSvc = mock(() => Promise.resolve({ id: "u1" }));
const mockDeleteUserSvc = mock(() => Promise.resolve());

mock.module("../../../src/modules/users/service.js", () => ({
  getUsers: mockGetUsers,
  getUserById: mockGetUserById,
  createUser: mockCreateUserSvc,
  updateUser: mockUpdateUserSvc,
  deleteUser: mockDeleteUserSvc,
}));

const ctrl = await import("../../../src/modules/users/controller");

beforeEach(() => {
  mockGetUsers.mockClear();
  mockGetUserById.mockClear();
  mockCreateUserSvc.mockClear();
  mockUpdateUserSvc.mockClear();
  mockDeleteUserSvc.mockClear();
});

describe("listUsers", () => {
  test("returns success", async () => {
    const result = await ctrl.listUsers({ query: { page: 1, limit: 10 } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns error on failure", async () => {
    mockGetUsers.mockRejectedValueOnce(new Error("db error"));
    const result = await ctrl.listUsers({ query: { page: 1, limit: 10 } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("getUser", () => {
  test("returns success when found", async () => {
    const result = await ctrl.getUser({ params: { id: "u1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockGetUserById.mockRejectedValueOnce(new Error("User not found"));
    const result = await ctrl.getUser({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("createUser", () => {
  test("creates user", async () => {
    const result = await ctrl.createUser({ body: { name: "J", email: "j@t.com", password: "pass" } as any });
    expect(result).toHaveProperty("success", true);
  });
});

describe("updateUser", () => {
  test("updates user", async () => {
    const result = await ctrl.updateUser({ params: { id: "u1" }, body: { name: "Jane" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockUpdateUserSvc.mockRejectedValueOnce(new Error("User not found"));
    const result = await ctrl.updateUser({ params: { id: "missing" }, body: {} });
    expect(result).toHaveProperty("success", false);
  });
});

describe("deleteUser", () => {
  test("deletes successfully", async () => {
    const result = await ctrl.deleteUser({ params: { id: "u1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockDeleteUserSvc.mockRejectedValueOnce(new Error("User not found"));
    const result = await ctrl.deleteUser({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});
