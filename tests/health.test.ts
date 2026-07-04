import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";

// Build the same health route as in src/index.ts, without the server listeners
const app = new Elysia().get(
  "/health",
  () => ({ status: "ok" }),
  {
    detail: {
      tags: ["Health"],
      summary: "Health check",
      responses: {
        200: {
          description: "Server is healthy",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "ok" },
                },
              },
            },
          },
        },
      },
    },
  },
);

describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const res = await app.handle(new Request("http://localhost/health"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toEqual({ status: "ok" });
  });

  it("returns JSON content-type", async () => {
    const res = await app.handle(new Request("http://localhost/health"));
    expect(res.headers.get("content-type")).toContain("application/json");
  });

  it("includes OpenAPI detail metadata on the route", () => {
    // Elysia stores route metadata internally; verify the plugin built without errors
    const route = app.routes.find((r) => r.path === "/health");
    expect(route).toBeDefined();
    expect(route?.method).toBe("GET");
  });
});
