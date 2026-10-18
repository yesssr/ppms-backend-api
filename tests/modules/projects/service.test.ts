import { describe, test, expect, mock, beforeEach } from "bun:test";
import { createChain, getSharedMockDb, clearMockDb } from "../../helpers/db-mock.js";

const mockDb = getSharedMockDb();

mock.module("../../../src/db/index.js", () => ({ db: getSharedMockDb() }));

const svc = await import("../../../src/modules/projects/service");

beforeEach(() => {
  clearMockDb(mockDb);
});

const fakeProject = {
  id: "p1",
  code: "PRJ-ABC123",
  name: "Test Project",
  clientId: "c1",
  clientName: "Client",
  status: "planning",
  progressPercentage: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// getProjectById enriches the project with its members and technologies.
const enrichedProject = {
  ...fakeProject,
  memberIds: [],
  technologyIds: [],
  members: [],
  technologies: [],
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
      .mockImplementationOnce(() =>
        createChain([{ project: fakeProject, client: { name: "Client" } }])
      )
      .mockImplementationOnce(() => createChain([{ count: 1 }]));
    const result = await svc.getProjects({ page: 1, limit: 10 });
    expect(result.data).toEqual([fakeProject]);
    expect(result.meta.total).toBe(1);
  });
});

describe("getProjectById", () => {
  test("returns project when found", async () => {
    mockDb.select.mockImplementationOnce(() =>
      createChain([{ project: fakeProject, client: { name: "Client" } }])
    );
    const result = await svc.getProjectById("p1");
    expect(result).toEqual(enrichedProject);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([]));
    await expect(svc.getProjectById("missing")).rejects.toThrow("Project not found");
  });
});

describe("createProject", () => {
  test("inserts project and returns it", async () => {
    mockDb.insert.mockImplementationOnce(() => createChain([fakeProject]));
    mockDb.select.mockImplementationOnce(() =>
      createChain([{ project: fakeProject, client: { name: "Client" } }])
    );
    const result = await svc.createProject({
      serviceId: "s1",
      createdBy: "u1",
      name: "Test",
      clientId: "c1",
      status: "planning",
    });
    expect(result).toEqual(enrichedProject);
    expect(mockDb.insert).toHaveBeenCalled();
  });
});

describe("updateProject", () => {
  test("updates and returns project", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([fakeProject]));
    mockDb.select.mockImplementationOnce(() =>
      createChain([{ project: fakeProject, client: { name: "Client" } }])
    );
    const result = await svc.updateProject("p1", { name: "Updated" });
    expect(result).toEqual(enrichedProject);
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
    const joined = [{ project: fakeProject, client: { name: "Client" } }];
    mockDb.select.mockImplementationOnce(() => createChain(joined));
    mockDb.update.mockImplementationOnce(() => createChain([fakeProject]));
    mockDb.insert.mockImplementationOnce(() => createChain([]));
    const result = await svc.updateProjectProgress("p1", {
      progressPercentage: 50,
      message: "Half done",
    });
    expect(result).toEqual(enrichedProject);
  });
});

describe("getProjectByIdentifier", () => {
  test("returns project by code", async () => {
    mockDb.select.mockImplementationOnce(() =>
      createChain([{ project: fakeProject, client: { name: "Client" } }])
    );
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
