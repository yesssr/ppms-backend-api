import { describe, test, expect, mock, beforeEach } from "bun:test";

const mockGetTeams = mock(() => Promise.resolve({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } }));
const mockGetTeamById = mock(() => Promise.resolve({ id: "t1", name: "Team" }));
const mockCreateTeamSvc = mock(() => Promise.resolve({ id: "t1" }));
const mockUpdateTeamSvc = mock(() => Promise.resolve({ id: "t1" }));
const mockDeleteTeamSvc = mock(() => Promise.resolve());
const mockGetTeamMembers = mock(() => Promise.resolve([]));
const mockAddTeamMemberSvc = mock(() => Promise.resolve({ teamId: "t1", userId: "u1" }));
const mockRemoveTeamMemberSvc = mock(() => Promise.resolve());

mock.module("../../../src/modules/teams/service.js", () => ({
  getTeams: mockGetTeams,
  getTeamById: mockGetTeamById,
  createTeam: mockCreateTeamSvc,
  updateTeam: mockUpdateTeamSvc,
  deleteTeam: mockDeleteTeamSvc,
  getTeamMembers: mockGetTeamMembers,
  addTeamMember: mockAddTeamMemberSvc,
  removeTeamMember: mockRemoveTeamMemberSvc,
}));

const ctrl = await import("../../../src/modules/teams/controller");

beforeEach(() => {
  mockGetTeams.mockClear();
  mockGetTeamById.mockClear();
  mockCreateTeamSvc.mockClear();
  mockUpdateTeamSvc.mockClear();
  mockDeleteTeamSvc.mockClear();
  mockGetTeamMembers.mockClear();
  mockAddTeamMemberSvc.mockClear();
  mockRemoveTeamMemberSvc.mockClear();
});

describe("listTeams", () => {
  test("returns success", async () => {
    const result = await ctrl.listTeams({ query: { page: 1, limit: 10 } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns error on failure", async () => {
    mockGetTeams.mockRejectedValueOnce(new Error("db error"));
    const result = await ctrl.listTeams({ query: { page: 1, limit: 10 } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("getTeam", () => {
  test("returns success when found", async () => {
    const result = await ctrl.getTeam({ params: { id: "t1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockGetTeamById.mockRejectedValueOnce(new Error("Team not found"));
    const result = await ctrl.getTeam({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("createTeam", () => {
  test("creates team", async () => {
    const result = await ctrl.createTeam({ body: { name: "T" } as any });
    expect(result).toHaveProperty("success", true);
  });
});

describe("updateTeam", () => {
  test("updates team", async () => {
    const result = await ctrl.updateTeam({ params: { id: "t1" }, body: { name: "U" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockUpdateTeamSvc.mockRejectedValueOnce(new Error("Team not found"));
    const result = await ctrl.updateTeam({ params: { id: "missing" }, body: {} });
    expect(result).toHaveProperty("success", false);
  });
});

describe("deleteTeam", () => {
  test("deletes successfully", async () => {
    const result = await ctrl.deleteTeam({ params: { id: "t1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockDeleteTeamSvc.mockRejectedValueOnce(new Error("Team not found"));
    const result = await ctrl.deleteTeam({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("listTeamMembers", () => {
  test("returns members", async () => {
    const result = await ctrl.listTeamMembers({ params: { id: "t1" } });
    expect(result).toHaveProperty("success", true);
  });
});

describe("addTeamMember", () => {
  test("adds member", async () => {
    const result = await ctrl.addTeamMember({ params: { id: "t1" }, body: { userId: "u1" } as any });
    expect(result).toHaveProperty("success", true);
  });
});

describe("removeTeamMember", () => {
  test("removes member", async () => {
    const result = await ctrl.removeTeamMember({ params: { id: "t1" }, body: { userId: "u1" } as any });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockRemoveTeamMemberSvc.mockRejectedValueOnce(new Error("Team member not found"));
    const result = await ctrl.removeTeamMember({ params: { id: "t1" }, body: { userId: "missing" } as any });
    expect(result).toHaveProperty("success", false);
  });
});
