import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { authPlugin } from "./modules/auth/auth.js";
import { authRoutes } from "./modules/auth/routes.js";

const main = () => {
  const app = new Elysia()
    // ── Swagger / OpenAPI ────────────────────────────────────────────────────
    .use(
      swagger({
        path: "/docs",
        documentation: {
          info: {
            title: "PPMS Backend API",
            version: "1.0.0",
            description:
              "Backend API for the Project & People Management System. " +
              "Authentication is handled via Better Auth with email/password.",
          },
          tags: [
            { name: "Health", description: "Service health check" },
            { name: "Auth", description: "Authentication endpoints" },
          ],
        },
      }),
    )

    // ── CORS ─────────────────────────────────────────────────────────────────
    .use(
      cors({
        origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
      }),
    )

    // ── Auth (middleware helper + routes) ────────────────────────────────────
    .use(authPlugin)
    .use(authRoutes)

    // ── Health ───────────────────────────────────────────────────────────────
    .get(
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

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
    console.log(`Swagger docs at http://localhost:${PORT}/docs`);
  });
};

main();
