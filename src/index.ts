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
import { clientRoutes } from "./modules/clients/routes.js";
import { dashboardRoutes } from "./modules/dashboard/routes.js";
import { projectRoutes } from "./modules/projects/routes.js";
import { caseStudyRoutes } from "./modules/case-studies/routes.js";
import { testimonialRoutes } from "./modules/testimonials/routes.js";
import { taskRoutes } from "./modules/tasks/routes.js";
import { documentRoutes } from "./modules/documents/routes.js";
import { notificationRoutes } from "./modules/notifications/routes.js";
import { deleteExpiredNotifications, checkAndSendDeadlineNotifications } from "./modules/notifications/service.js";
import { AuthUser } from "./types/auth.js";

// Import types first to ensure module augmentation is applied
import "./types/auth.js";

const clientIp = (req: any) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  req.headers.get("x-real-ip") ||
  "unknown";

const skipPublic = (req: any) => {
  const path = new URL(req.url).pathname;
  return path === "/health" || path.startsWith("/openapi");
};

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

  // Public routes (before auth guard)
  app.get("/health", () => ({ status: "ok" }));

  // Auth rate limiter
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

  // General rate limiter
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

  // Auth guard (derive to attach user to context)
  app.derive(async ({ request, set, status }) => {
    const url = new URL(request.url);
    const path = url.pathname;
    const requiredRole = getRequiredRole(request.method, path);

    if (requiredRole === null) return {};

    const session = await getSessionFromHeaders(request.headers);
    if (!session) {
      set.status = 401;
      return {};
    }

    if (requiredRole === "admin" && session.user.role !== "admin") {
      set.status = 403;
      return {};
    }

    return {
      user: {
        id: session.user.id,
        role: session.user.role,
        email: session.user.email,
        name: session.user.name,
      } as AuthUser,
    };
  });

  app.use(departmentRoutes);
  app.use(serviceRoutes);
  app.use(technologyRoutes);
  app.use(teamRoutes);
  app.use(userRoutes);
  app.use(clientRoutes);
  app.use(dashboardRoutes);
  app.use(projectRoutes);
  app.use(caseStudyRoutes);
  app.use(testimonialRoutes);
  app.use(taskRoutes);
  app.use(documentRoutes);
  app.use(notificationRoutes);

  setInterval(async () => {
    try {
      await checkAndSendDeadlineNotifications();
      console.log("[Cron] Deadline notifications check completed");
    } catch (err) {
      console.error("[Cron] Deadline notifications check failed:", err);
    }
  }, 6 * 60 * 60 * 1000);

  setInterval(async () => {
    try {
      const deleted = await deleteExpiredNotifications();
      console.log(`[Cron] Deleted ${deleted} expired notifications`);
    } catch (err) {
      console.error("[Cron] Expired notifications cleanup failed:", err);
    }
  }, 24 * 60 * 60 * 1000);

  const PORT = config.app.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
  });
};

main();
