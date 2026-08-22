import { describe, test, expect, mock } from "bun:test";

mock.module("../../../src/config/conf.js", () => ({
  config: {
    app: { NODE_ENV: "test", PORT: 3000, FRONTEND_URL: "http://localhost:5173" },
    database: { url: "postgresql://test" },
    auth: { betterAuthUrl: "http://localhost:3000", betterAuthSecret: "test-secret" },
    storage: {
      accessKey: "key", secretKey: "secret", region: "us-east-1",
      bucketName: "bucket", endpointUrlS3: "https://s3.test",
      endpointUrlIAM: "https://iam.test", publicUrl: "https://cdn.test",
    },
  },
}));

mock.module("../../../src/modules/auth/auth.js", () => ({
  auth: { api: { getSession: mock(() => Promise.resolve(null)) } },
  authPlugin: {},
}));

const { getRequiredRole } = await import("../../../src/modules/auth/guard");

describe("getRequiredRole", () => {
  test("returns null for /health", () => {
    expect(getRequiredRole("GET", "/health")).toBeNull();
  });

  test("returns null for /api/auth/* paths", () => {
    expect(getRequiredRole("POST", "/api/auth/sign-in")).toBeNull();
    expect(getRequiredRole("GET", "/api/auth/session")).toBeNull();
  });

  test("returns null for /api/projects/track/* paths", () => {
    expect(getRequiredRole("GET", "/api/projects/track/PRJ-ABC123")).toBeNull();
  });

  test("returns admin for /api/departments (all methods)", () => {
    expect(getRequiredRole("GET", "/api/departments")).toBe("admin");
    expect(getRequiredRole("POST", "/api/departments")).toBe("admin");
    expect(getRequiredRole("PUT", "/api/departments/123")).toBe("admin");
    expect(getRequiredRole("DELETE", "/api/departments/123")).toBe("admin");
  });

  test("returns admin for /api/services (all methods)", () => {
    expect(getRequiredRole("GET", "/api/services")).toBe("admin");
    expect(getRequiredRole("POST", "/api/services")).toBe("admin");
  });

  test("returns admin for /api/users (all methods)", () => {
    expect(getRequiredRole("GET", "/api/users")).toBe("admin");
    expect(getRequiredRole("POST", "/api/users")).toBe("admin");
    expect(getRequiredRole("PUT", "/api/users/123")).toBe("admin");
  });

  test("returns developer for GET on mixed modules", () => {
    expect(getRequiredRole("GET", "/api/technologies")).toBe("developer");
    expect(getRequiredRole("GET", "/api/teams")).toBe("developer");
    expect(getRequiredRole("GET", "/api/case-studies")).toBe("developer");
    expect(getRequiredRole("GET", "/api/testimonials")).toBe("developer");
  });

  test("returns admin for write on mixed modules", () => {
    expect(getRequiredRole("POST", "/api/technologies")).toBe("admin");
    expect(getRequiredRole("PUT", "/api/teams/123")).toBe("admin");
    expect(getRequiredRole("DELETE", "/api/case-studies/123")).toBe("admin");
    expect(getRequiredRole("POST", "/api/testimonials")).toBe("admin");
  });

  test("returns admin for projects logs endpoint", () => {
    expect(getRequiredRole("GET", "/api/projects/123/logs")).toBe("admin");
  });

  test("returns developer for projects progress endpoint", () => {
    expect(getRequiredRole("PUT", "/api/projects/123/progress")).toBe("developer");
  });

  test("returns developer for GET on projects", () => {
    expect(getRequiredRole("GET", "/api/projects")).toBe("developer");
    expect(getRequiredRole("GET", "/api/projects/123")).toBe("developer");
  });

  test("returns admin for write on projects", () => {
    expect(getRequiredRole("POST", "/api/projects")).toBe("admin");
    expect(getRequiredRole("PUT", "/api/projects/123")).toBe("admin");
    expect(getRequiredRole("DELETE", "/api/projects/123")).toBe("admin");
  });

  test("returns developer for documents (all methods)", () => {
    expect(getRequiredRole("GET", "/api/documents")).toBe("developer");
    expect(getRequiredRole("POST", "/api/documents")).toBe("developer");
    expect(getRequiredRole("PUT", "/api/documents/123")).toBe("developer");
  });

  test("returns developer for tasks (all methods)", () => {
    expect(getRequiredRole("GET", "/api/tasks")).toBe("developer");
    expect(getRequiredRole("POST", "/api/tasks")).toBe("developer");
    expect(getRequiredRole("DELETE", "/api/tasks/123")).toBe("developer");
  });

  test("returns developer for any other /api/* path", () => {
    expect(getRequiredRole("GET", "/api/unknown")).toBe("developer");
  });

  test("returns null for non-api paths", () => {
    expect(getRequiredRole("GET", "/some-page")).toBeNull();
    expect(getRequiredRole("GET", "/")).toBeNull();
  });

  test("method matching is case-insensitive", () => {
    expect(getRequiredRole("get", "/api/projects")).toBe("developer");
    expect(getRequiredRole("post", "/api/projects")).toBe("admin");
  });
});
