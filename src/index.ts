import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { rateLimit as rateLimitPlugin } from "elysia-rate-limit";
import { authPlugin } from "./modules/auth/auth.js";
import { getRequiredRole, getSessionFromHeaders } from "./modules/auth/guard.js";
import { openapiPlugin } from "./docs/openapi.js";
import { config } from "./config/conf.js";
import { departmentRoutes } from "./modules/departements/routes.js";
import { serviceRoutes } from "./modules/services/routes.js";
import { technologyRoutes } from "./modules/technology/routes.js";
import { teamRoutes } from "./modules/teams/routes.js";
import { userRoutes } from "./modules/users/routes.js";
import { projectRoutes } from "./modules/projects/routes.js";
import { caseStudyRoutes } from "./modules/case-studies/routes.js";
import { testimonialRoutes } from "./modules/testimonials/routes.js";
import { taskRoutes } from "./modules/tasks/routes.js";
import { documentRoutes } from "./modules/documents/routes.js";

// Per-client-IP rate limiting.
// - Auth endpoints (/api/auth/*): strict fixed-window limiter (10 req / 60s)
//   via onRequest. Better Auth core has no built-in rate limiter and is mounted
//   as a raw handler (.mount), so Elysia lifecycle plugins do NOT intercept
//   /api/auth/* — an explicit onRequest hook is required for brute-force protection.
// - General API (/api/* except auth): elysia-rate-limit plugin (120 req / 60s).
// Public docs (/openapi) and /health are not rate-limited.
const clientIp = (req: any) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  req.headers.get("x-real-ip") ||
  "unknown";

const skipPublic = (req: any) => {
  const path = new URL(req.url).pathname;
  return path === "/health" || path.startsWith("/openapi");
};

// Small fixed-window counter for the strict auth limiter (10 req / 60s per IP).
const AUTH_WINDOW_MS = 60_000;
const AUTH_MAX = 10;
const authHits = new Map<string, { count: number; resetAt: number }>();
const authAllowed = (ip: string): boolean => {
  const now = Date.now();
  const bucket = authHits.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    authHits.set(ip, { count: 1, resetAt: now + AUTH_WINDOW_MS });
    return true;
  }
  if (bucket.count >= AUTH_MAX) return false;
  bucket.count += 1;
  return true;
};

const main = () => {
  const app = new Elysia();

  app.use(
    cors({
      origin: config.app.FRONTEND_URL,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(authPlugin);
  app.use(openapiPlugin);

  // Strict auth limiter — runs as onRequest so it fires before the mounted
  // Better Auth handler. Returns 429 with the standard error envelope.
  app.onRequest(({ request, set, status }) => {
    const path = new URL(request.url).pathname;
    if (!path.startsWith("/api/auth")) return;
    if (!authAllowed(clientIp(request))) {
      set.headers["Retry-After"] = String(Math.ceil(AUTH_WINDOW_MS / 1000));
      return status(429, {
        success: false,
        data: null,
        message: "Too many requests, please try again later",
        error: { message: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" },
      } as any);
    }
  });

  // General limiter for the rest of the API (skips /health and /openapi).
  app.use(
    rateLimitPlugin({
      max: 120,
      duration: 60_000,
      generator: clientIp,
      skip: skipPublic,
      scoping: "global",
      headers: true,
      errorResponse:
        '{"success":false,"data":null,"message":"Too many requests, please try again later","error":{"message":"Rate limit exceeded","code":"RATE_LIMIT_EXCEEDED"}}',
    })
  );

  // Global authorization guard. Enforces session + role for every /api route
  // except public ones (Better Auth, client tracking, health). Routes are
  // mounted (not composed as plugins) to keep route registration deterministic.
  app.onBeforeHandle(async ({ request, status }) => {
    const url = new URL(request.url);
    const path = url.pathname;
    const requiredRole = getRequiredRole(request.method, path);

    if (requiredRole === null) return;

    const session = await getSessionFromHeaders(request.headers);
    if (!session) return status(401);

    if (requiredRole === "admin" && session.user.role !== "admin") {
      return status(403);
    }

    return;
  });

  app.use(departmentRoutes);
  app.use(serviceRoutes);
  app.use(technologyRoutes);
  app.use(teamRoutes);
  app.use(userRoutes);
  app.use(projectRoutes);
  app.use(caseStudyRoutes);
  app.use(testimonialRoutes);
  app.use(taskRoutes);
  app.use(documentRoutes);

  app.get("/health", () => ({
    status: "ok",
  }));

  const PORT = config.app.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
  });
};

main();
