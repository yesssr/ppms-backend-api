import { describe, test, expect, mock, beforeEach } from "bun:test";
import { createChain, getSharedMockDb, clearMockDb } from "../../helpers/db-mock.js";

const mockDb = getSharedMockDb();

mock.module("../../../src/db/index.js", () => ({ db: getSharedMockDb() }));

mock.module("../../../src/modules/auth/schema.js", () => ({
  user: { id: "id", name: "name", email: "email" },
  account: { id: "id", accountId: "accountId" },
}));

mock.module("@better-auth/utils/password", () => ({
  hashPassword: mock(() => Promise.resolve("hashed-password")),
}));

mock.module("../../../src/modules/teams/schema.js", () => ({
  teamMember: { userId: "userId", teamId: "teamId" },
  team: { id: "id", name: "name" },
}));

mock.module("../../../src/modules/departements/schema.js", () => ({
  departments: { id: "id", name: "name" },
}));

mock.module("../../../src/modules/projects/schema.js", () => ({
  projectMember: { projectId: "projectId", userId: "userId" },
}));

const svc = await import("../../../src/modules/users/service");

beforeEach(() => {
  clearMockDb(mockDb);
});

const fakeUser = { id: "u1", name: "John", email: "john@test.com", role: "developer" };

describe("getUsers", () => {
  test("returns paginated users", async () => {
    mockDb.select
      .mockImplementationOnce(() => createChain([fakeUser]))
      .mockImplementationOnce(() => createChain([{ count: 1 }]))
      .mockImplementationOnce(() => createChain([]));
    const result = await svc.getUsers({ page: 1, limit: 10 });
    expect(result.meta.total).toBe(1);
  });
});

describe("getUserById", () => {
  test("returns user when found", async () => {
    mockDb.select
      .mockImplementationOnce(() => createChain([fakeUser]))
      .mockImplementationOnce(() => createChain([]));
    const result = await svc.getUserById("u1");
    expect(result).toHaveProperty("id", "u1");
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([]));
    await expect(svc.getUserById("missing")).rejects.toThrow("User not found");
  });
});

describe("createUser", () => {
  test("creates user with hashed password", async () => {
    mockDb.insert
      .mockImplementationOnce(() => createChain([]))
      .mockImplementationOnce(() => createChain([]));
    mockDb.select
      .mockImplementationOnce(() => createChain([fakeUser]))
      .mockImplementationOnce(() => createChain([]));
    const result = await svc.createUser({
      name: "John",
      email: "john@test.com",
      password: "secret123",
    });
    expect(result).toHaveProperty("id", "u1");
  });
});

describe("updateUser", () => {
  test("updates and returns user", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([fakeUser]));
    const result = await svc.updateUser("u1", { name: "Jane" });
    expect(result).toHaveProperty("id", "u1");
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([]));
    await expect(svc.updateUser("missing", {})).rejects.toThrow("User not found");
  });
});

describe("deleteUser", () => {
  test("deletes successfully", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([{ id: "u1" }]));
    await expect(svc.deleteUser("u1")).resolves.toBeUndefined();
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([]));
    await expect(svc.deleteUser("missing")).rejects.toThrow("User not found");
  });
});
