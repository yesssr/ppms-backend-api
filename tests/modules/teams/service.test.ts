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

const svc = await import("../../../src/modules/teams/service");

beforeEach(() => {
  mockDb.select.mockClear();
  mockDb.insert.mockClear();
  mockDb.update.mockClear();
  mockDb.delete.mockClear();
});

const fakeTeam = { id: "team1", name: "Alpha" };

describe("getTeams", () => {
  test("returns paginated teams", async () => {
    mockDb.select
      .mockImplementationOnce(() => createChain([fakeTeam]))
      .mockImplementationOnce(() => createChain([{ count: 1 }]));
    const result = await svc.getTeams({ page: 1, limit: 10 });
    expect(result.data).toEqual([fakeTeam]);
    expect(result.meta.total).toBe(1);
  });
});

describe("getTeamById", () => {
  test("returns team when found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([fakeTeam]));
    const result = await svc.getTeamById("team1");
    expect(result).toEqual(fakeTeam);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([]));
    await expect(svc.getTeamById("missing")).rejects.toThrow("Team not found");
  });
});

describe("createTeam", () => {
  test("inserts and returns team", async () => {
    mockDb.insert.mockImplementationOnce(() => createChain([fakeTeam]));
    const result = await svc.createTeam({ name: "Alpha" } as any);
    expect(result).toEqual(fakeTeam);
  });
});

describe("updateTeam", () => {
  test("updates and returns team", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([fakeTeam]));
    const result = await svc.updateTeam("team1", { name: "Beta" });
    expect(result).toEqual(fakeTeam);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([]));
    await expect(svc.updateTeam("missing", {})).rejects.toThrow("Team not found");
  });
});

describe("deleteTeam", () => {
  test("deletes successfully", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([{ id: "team1" }]));
    await expect(svc.deleteTeam("team1")).resolves.toBeUndefined();
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([]));
    await expect(svc.deleteTeam("missing")).rejects.toThrow("Team not found");
  });
});

describe("getTeamMembers", () => {
  test("returns members array", async () => {
    const members = [{ teamId: "team1", userId: "u1" }];
    mockDb.select.mockImplementationOnce(() => createChain(members));
    const result = await svc.getTeamMembers("team1");
    expect(result).toEqual(members);
  });
});

describe("addTeamMember", () => {
  test("inserts and returns member", async () => {
    const member = { teamId: "team1", userId: "u1" };
    mockDb.insert.mockImplementationOnce(() => createChain([member]));
    const result = await svc.addTeamMember(member as any);
    expect(result).toEqual(member);
  });
});

describe("removeTeamMember", () => {
  test("removes successfully", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([{ teamId: "team1" }]));
    await expect(svc.removeTeamMember("team1", "u1")).resolves.toBeUndefined();
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([]));
    await expect(svc.removeTeamMember("team1", "missing")).rejects.toThrow("Team member not found");
  });
});

describe("getUserTeams", () => {
  test("returns teams for user", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([{ team: fakeTeam }]));
    const result = await svc.getUserTeams("u1");
    expect(result).toEqual([fakeTeam]);
  });
});
