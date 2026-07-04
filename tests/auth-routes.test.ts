import { describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";

// ── Mocks — must be declared BEFORE any module that transitively imports   ──
//     better-auth, @better-auth/drizzle-adapter, or the db module.          ──

mock.module("better-auth", () => ({
  betterAuth: () => ({
    handler: mock((_req: Request) =>
      new Response(JSON.stringify({ mocked: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ),
    api: { getSession: mock(() => null) },
  }),
}));

mock.module("@better-auth/drizzle-adapter", () => ({
  drizzleAdapter: () => ({}),
}));

// ── Dynamic imports after mocks are registered ────────────────────────────

const modAuth = await import("../src/modules/auth/auth.js");
const { authRoutes } = await import("../src/modules/auth/routes.js");

// Build a minimal Elysia app with just the auth plugin and routes
const app = new Elysia().use(modAuth.authPlugin).use(authRoutes);

// ── Helpers ───────────────────────────────────────────────────────────────

const post = (path: string, body: unknown) =>
  app.handle(
    new Request(`http://localhost${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

const get = (path: string) =>
  app.handle(new Request(`http://localhost${path}`));

// ── Tests ─────────────────────────────────────────────────────────────────

describe("Auth Routes — structure", () => {
  const authPaths = app.routes.filter((r) => r.path.startsWith("/api/auth"));

  it("registers 7 auth endpoints", () => {
    expect(authPaths.length).toBe(7);
  });

  const expected: [string, string][] = [
    ["POST", "/api/auth/sign-up/email"],
    ["POST", "/api/auth/sign-in/email"],
    ["POST", "/api/auth/sign-out"],
    ["GET",  "/api/auth/get-session"],
    ["POST", "/api/auth/forget-password"],
    ["POST", "/api/auth/reset-password"],
    ["GET",  "/api/auth/verify-email"],
  ];

  for (const [method, path] of expected) {
    it(`has ${method} ${path}`, () => {
      const r = authPaths.find((x) => x.path === path && x.method === method);
      expect(r).toBeDefined();
    });
  }
});

describe("Auth Routes — validation", () => {
  it("rejects sign-up without email (422)", async () => {
    const res = await post("/api/auth/sign-up/email", {
      password: "s3cret!!",
    });
    expect(res.status).toBe(422);
  });

  it("rejects sign-up with short password (422)", async () => {
    const res = await post("/api/auth/sign-up/email", {
      email: "a@b.com",
      password: "short",
    });
    expect(res.status).toBe(422);
  });

  it("rejects sign-in without password (422)", async () => {
    const res = await post("/api/auth/sign-in/email", {
      email: "a@b.com",
    });
    expect(res.status).toBe(422);
  });

  it("rejects forget-password without email (422)", async () => {
    const res = await post("/api/auth/forget-password", {});
    expect(res.status).toBe(422);
  });

  it("rejects reset-password without required fields (422)", async () => {
    const res = await post("/api/auth/reset-password", {
      token: "abc",
    });
    expect(res.status).toBe(422);
  });

  it("rejects verify-email without token query param (422)", async () => {
    const res = await get("/api/auth/verify-email");
    expect(res.status).toBe(422);
  });

  it("accepts valid sign-up body and forwards (200)", async () => {
    const res = await post("/api/auth/sign-up/email", {
      email: "valid@example.com",
      password: "supersecret!!",
    });
    expect(res.status).toBe(200);
  });

  it("accepts valid sign-in body (200)", async () => {
    const res = await post("/api/auth/sign-in/email", {
      email: "user@example.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
  });

  it("accepts sign-out with empty body (200)", async () => {
    const res = await post("/api/auth/sign-out", {});
    expect(res.status).toBe(200);
  });
});
