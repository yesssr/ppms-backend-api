import { auth } from "./auth.js";

export type RequiredRole = "admin" | "developer" | null;

// Returns the role required to access a given method+path, or null if public.
// Public paths: Better Auth endpoints (/api/auth/*), the client-facing project
// tracking endpoint (/api/projects/track/*), and the health check.
export const getRequiredRole = (method: string, path: string): RequiredRole => {
  if (path.startsWith("/api/auth")) return null;
  if (path.startsWith("/api/projects/track/")) return null;
  if (path === "/health") return null;

  const m = method.toUpperCase();
  const isRead = m === "GET";

  // Admin-only modules.
  if (
    path.startsWith("/api/departments") ||
    path.startsWith("/api/services") ||
    path.startsWith("/api/users")
  ) {
    return "admin";
  }

  // Mixed modules: reads allowed for developers, writes require admin.
  if (
    path.startsWith("/api/technologies") ||
    path.startsWith("/api/teams") ||
    path.startsWith("/api/case-studies") ||
    path.startsWith("/api/testimonials")
  ) {
    return isRead ? "developer" : "admin";
  }

  if (path.startsWith("/api/projects")) {
    // Full project log is admin-only; progress updates are developer.
    if (path.endsWith("/logs")) return "admin";
    if (path.endsWith("/progress")) return "developer";
    return isRead ? "developer" : "admin";
  }

  // Developer-full-access modules.
  if (path.startsWith("/api/documents") || path.startsWith("/api/tasks")) {
    return "developer";
  }

  // Anything else under /api requires authentication (default to developer).
  if (path.startsWith("/api/")) return "developer";

  return null;
};

export const getSessionFromHeaders = (headers: Headers) => auth.api.getSession({ headers });
