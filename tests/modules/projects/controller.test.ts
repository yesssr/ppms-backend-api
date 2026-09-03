import { describe, test, expect, mock, beforeEach } from "bun:test";

const mockGetProjects = mock(() => Promise.resolve({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } }));
const mockGetProjectById = mock(() => Promise.resolve({ id: "p1", name: "Project" }));
const mockCreateProjectSvc = mock(() => Promise.resolve({ id: "p1" }));
const mockUpdateProjectSvc = mock(() => Promise.resolve({ id: "p1" }));
const mockDeleteProjectSvc = mock(() => Promise.resolve());
const mockGenerateThumbnailKey = mock(() => "projects/thumbnails/key.jpg");
const mockUploadThumbnail = mock(() => Promise.resolve("https://cdn.url/key.jpg"));
const mockUpdateProjectProgressSvc = mock(() => Promise.resolve({ id: "p1" }));
const mockGetProjectByIdentifierSvc = mock(() => Promise.resolve({ id: "p1", name: "Track" }));
const mockGetProjectLogsSvc = mock(() => Promise.resolve([]));
const mockGetSession = mock(() => Promise.resolve({ user: { id: "u1" } }));

mock.module("../../../src/modules/projects/service.js", () => ({
  getProjects: mockGetProjects,
  getProjectById: mockGetProjectById,
  createProject: mockCreateProjectSvc,
  updateProject: mockUpdateProjectSvc,
  deleteProject: mockDeleteProjectSvc,
  generateThumbnailKey: mockGenerateThumbnailKey,
  uploadThumbnail: mockUploadThumbnail,
  updateProjectProgress: mockUpdateProjectProgressSvc,
  getProjectByIdentifier: mockGetProjectByIdentifierSvc,
  getProjectLogs: mockGetProjectLogsSvc,
}));

mock.module("../../../src/modules/auth/auth.js", () => ({
  auth: { api: { getSession: mockGetSession } },
}));

const ctrl = await import("../../../src/modules/projects/controller");

beforeEach(() => {
  mockGetProjects.mockClear();
  mockGetProjectById.mockClear();
  mockCreateProjectSvc.mockClear();
  mockUpdateProjectSvc.mockClear();
  mockDeleteProjectSvc.mockClear();
  mockGetSession.mockClear();
  mockGetProjectLogsSvc.mockClear();
  mockGetProjectByIdentifierSvc.mockClear();
});

describe("listProjects", () => {
  test("returns paginated result", async () => {
    const result = await ctrl.listProjects({ query: { page: 1, limit: 10 } }) as any;
    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("meta");
  });

  test("returns error on failure", async () => {
    mockGetProjects.mockRejectedValueOnce(new Error("db error"));
    const result = await ctrl.listProjects({ query: { page: 1, limit: 10 } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("getProject", () => {
  test("returns success when found", async () => {
    const result = await ctrl.getProject({ params: { id: "p1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockGetProjectById.mockRejectedValueOnce(new Error("Project not found"));
    const result = await ctrl.getProject({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("createProject", () => {
  test("creates project without file", async () => {
    const result = await ctrl.createProject({
      body: {
        serviceId: "s1", createdBy: "u1", name: "P", clientId: "c1",
        status: "planning",
      },
    });
    expect(result).toHaveProperty("success", true);
  });

  test("rejects invalid image type", async () => {
    const file = new File(["x"], "test.txt", { type: "text/plain" });
    Object.defineProperty(file, "size", { value: 100 });
    const result = await ctrl.createProject({
      body: {
        serviceId: "s1", createdBy: "u1", name: "P", clientId: "c1",
        status: "planning", thumbnailFile: file,
      },
    });
    expect(result).toHaveProperty("success", false);
  });

  test("rejects oversized image", async () => {
    const file = new File(["x"], "big.png", { type: "image/png" });
    Object.defineProperty(file, "size", { value: 20 * 1024 * 1024 });
    const result = await ctrl.createProject({
      body: {
        serviceId: "s1", createdBy: "u1", name: "P", clientId: "c1",
        status: "planning", thumbnailFile: file,
      },
    });
    expect(result).toHaveProperty("success", false);
  });
});

describe("updateProject", () => {
  test("updates project", async () => {
    const result = await ctrl.updateProject({
      params: { id: "p1" },
      body: { name: "Updated" },
    });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockUpdateProjectSvc.mockRejectedValueOnce(new Error("Project not found"));
    const result = await ctrl.updateProject({
      params: { id: "missing" },
      body: { name: "X" },
    });
    expect(result).toHaveProperty("success", false);
  });
});

describe("updateProjectProgress", () => {
  test("updates progress with session", async () => {
    const result = await ctrl.updateProjectProgress({
      params: { id: "p1" },
      body: { progressPercentage: 50 },
      request: { headers: new Headers() } as Request,
    });
    expect(result).toHaveProperty("success", true);
    expect(mockGetSession).toHaveBeenCalled();
  });
});

describe("getProjectLogs", () => {
  test("returns logs", async () => {
    const result = await ctrl.getProjectLogs({ params: { id: "p1" } });
    expect(result).toHaveProperty("success", true);
  });
});

describe("trackProject", () => {
  test("returns tracking data", async () => {
    const result = await ctrl.trackProject({ params: { code: "PRJ-ABC" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found for invalid code", async () => {
    mockGetProjectByIdentifierSvc.mockRejectedValueOnce(new Error("Project not found"));
    const result = await ctrl.trackProject({ params: { code: "INVALID" } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("deleteProject", () => {
  test("deletes successfully", async () => {
    const result = await ctrl.deleteProject({ params: { id: "p1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockDeleteProjectSvc.mockRejectedValueOnce(new Error("Project not found"));
    const result = await ctrl.deleteProject({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});
