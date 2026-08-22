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
  mockDb.select.mockClear();
  mockDb.insert.mockClear();
  mockDb.update.mockClear();
  mockDb.delete.mockClear();
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
