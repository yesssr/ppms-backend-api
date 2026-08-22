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

const svc = await import("../../../src/modules/projects/service");

beforeEach(() => {
  mockDb.select.mockClear();
  mockDb.insert.mockClear();
  mockDb.update.mockClear();
  mockDb.delete.mockClear();
});

const fakeProject = {
  id: "p1",
  code: "PRJ-ABC123",
  name: "Test Project",
  clientName: "Client",
  status: "planning",
  progressPercentage: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("generateProjectCode", () => {
  test("returns string starting with PRJ-", () => {
    const code = svc.generateProjectCode();
    expect(code).toMatch(/^PRJ-[A-Z0-9]{6}$/);
  });

  test("generates unique codes", () => {
    const codes = new Set(Array.from({ length: 50 }, () => svc.generateProjectCode()));
    expect(codes.size).toBe(50);
  });
});

describe("getProjects", () => {
  test("calls db.select and returns paginated result", async () => {
    mockDb.select
      .mockImplementationOnce(() => createChain([fakeProject]))
      .mockImplementationOnce(() => createChain([{ count: 1 }]));
    const result = await svc.getProjects({ page: 1, limit: 10 });
    expect(result.data).toEqual([fakeProject]);
    expect(result.meta.total).toBe(1);
  });
});

describe("getProjectById", () => {
  test("returns project when found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([fakeProject]));
    const result = await svc.getProjectById("p1");
    expect(result).toEqual(fakeProject);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([]));
    await expect(svc.getProjectById("missing")).rejects.toThrow("Project not found");
  });
});

describe("createProject", () => {
  test("inserts project and returns it", async () => {
    mockDb.insert.mockImplementationOnce(() => createChain([fakeProject]));
    mockDb.select.mockImplementationOnce(() => createChain([fakeProject]));
    const result = await svc.createProject({
      serviceId: "s1",
      createdBy: "u1",
      name: "Test",
      clientName: "Client",
      status: "planning",
    });
    expect(result).toEqual(fakeProject);
    expect(mockDb.insert).toHaveBeenCalled();
  });
});

describe("updateProject", () => {
  test("updates and returns project", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([fakeProject]));
    const result = await svc.updateProject("p1", { name: "Updated" });
    expect(result).toEqual(fakeProject);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([]));
    await expect(svc.updateProject("missing", { name: "X" })).rejects.toThrow("Project not found");
  });
});

describe("deleteProject", () => {
  test("deletes successfully", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([{ id: "p1" }]));
    await expect(svc.deleteProject("p1")).resolves.toBeUndefined();
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([]));
    await expect(svc.deleteProject("missing")).rejects.toThrow("Project not found");
  });
});

describe("updateProjectProgress", () => {
  test("updates progress and inserts log", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([fakeProject]));
    mockDb.update.mockImplementationOnce(() => createChain([fakeProject]));
    mockDb.insert.mockImplementationOnce(() => createChain([]));
    const result = await svc.updateProjectProgress("p1", {
      progressPercentage: 50,
      message: "Half done",
    });
    expect(result).toEqual(fakeProject);
  });
});

describe("getProjectByIdentifier", () => {
  test("returns project by code", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([fakeProject]));
    const result = await svc.getProjectByIdentifier("PRJ-ABC123");
    expect(result).toEqual(fakeProject);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([]));
    await expect(svc.getProjectByIdentifier("INVALID")).rejects.toThrow("Project not found");
  });
});

describe("getProjectLogs", () => {
  test("returns logs array", async () => {
    const logs = [{ id: "l1", projectId: "p1", progressPercentage: 50 }];
    mockDb.select.mockImplementationOnce(() => createChain(logs));
    const result = await svc.getProjectLogs("p1");
    expect(result).toEqual(logs);
  });
});

describe("addProjectTechnology", () => {
  test("inserts and returns relation", async () => {
    const rel = { projectId: "p1", technologyId: "t1" };
    mockDb.insert.mockImplementationOnce(() => createChain([rel]));
    const result = await svc.addProjectTechnology("p1", "t1");
    expect(result).toEqual(rel);
  });
});

describe("removeProjectTechnology", () => {
  test("removes successfully", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([{ projectId: "p1" }]));
    await expect(svc.removeProjectTechnology("p1", "t1")).resolves.toBeUndefined();
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([]));
    await expect(svc.removeProjectTechnology("p1", "missing")).rejects.toThrow("Project technology not found");
  });
});

describe("addProjectMember", () => {
  test("inserts and returns member", async () => {
    const member = { projectId: "p1", userId: "u1" };
    mockDb.insert.mockImplementationOnce(() => createChain([member]));
    const result = await svc.addProjectMember("p1", "u1");
    expect(result).toEqual(member);
  });
});

describe("removeProjectMember", () => {
  test("removes successfully", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([{ projectId: "p1" }]));
    await expect(svc.removeProjectMember("p1", "u1")).resolves.toBeUndefined();
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([]));
    await expect(svc.removeProjectMember("p1", "missing")).rejects.toThrow("Project member not found");
  });
});
