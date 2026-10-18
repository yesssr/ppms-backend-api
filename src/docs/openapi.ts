import { openapi } from "@elysiajs/openapi";
import { t } from "elysia";
import { config } from "../config/conf.js";
import {
  apiResponse,
  apiListResponse,
  apiSuccessList,
  errorResponse,
  departmentSchema,
  serviceSchema,
  technologySchema,
  teamSchema,
  teamMemberSchema,
  userWithRelationsSchema,
  projectSchema,
  projectLogSchema,
  caseStudySchema,
  testimonialSchema,
  documentSchema,
  documentDownloadSchema,
  taskSchema,
  clientSchema,
  dashboardSchema,
} from "./schemas.js";

export const openapiPlugin = openapi({
  path: "/openapi",
  provider: "swagger-ui",
  documentation: {
    info: {
      title: "PPMS Backend API",
      version: "1.0.0",
      description: [
        "Project Portfolio Management System — backend API.",
        "",
        "## Authentication",
        "Sessions are managed by Better Auth (cookie-based, no JWT). Authenticate via POST /api/auth/sign-in/email, then send the session cookie with every request.",
        "",
        "## Authorization",
        "Two roles exist: admin and developer.",
        "- admin: full CRUD on all modules.",
        "- developer: can view projects/technologies/teams, manage documents & tasks, and update project progress; cannot access departments/services/users CRUD.",
        "Endpoints tagged Public require no authentication (Better Auth endpoints and the client project-tracking endpoint).",
        "",
        "## Response Format",
        "On success every endpoint returns { success: true, data: <payload>, message: string, error: null, meta: { page, limit, total, totalPages } } for lists, or { success, data, message, error, meta: null } for single items.",
        "On failure it returns { success: false, data: null, message: string, error: { message, code, details }, meta: null }.",
      ].join("\n"),
    },
    servers: [
      {
        url: `http://localhost:${config.app.PORT || 3000}`,
        description: "Local development server",
      },
      {
        url: config.app.BACKEND_URL,
        description: "Production server",
      },
    ],
    tags: [
      { name: "Authentication", description: "Better Auth session endpoints" },
      {
        name: "Tracking",
        description: "Public client-facing project progress tracking",
      },
      { name: "Departments", description: "Master data — admin only" },
      { name: "Services", description: "Master data — admin only" },
      {
        name: "Technologies",
        description: "Master data — reads by developer, writes by admin",
      },
      {
        name: "Teams",
        description: "Working groups — reads by developer, writes by admin",
      },
      { name: "Users", description: "Internal employees — admin only" },
      { name: "Projects", description: "Portfolio projects" },
      {
        name: "Case Studies",
        description:
          "Project case studies — reads by developer, writes by admin",
      },
      {
        name: "Testimonials",
        description:
          "Client testimonials — reads by developer, writes by admin",
      },
      {
        name: "Documents",
        description: "Project documents — developer full access",
      },
      { name: "Tasks", description: "Project tasks — developer full access" },
      { name: "Clients", description: "Master data — admin only" },
      { name: "Dashboard", description: "Analytics dashboard — reads by developer" },
    ],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
          description:
            "Better Auth session cookie returned after sign-in. Send it with protected requests.",
        },
      },
    },
    paths: {
      "/api/auth/sign-in/email": {
        post: {
          tags: ["Authentication"],
          summary: "Sign in (email + password)",
          description:
            "Authenticates an internal employee and sets the session cookie. No prior authentication required.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 8 },
                    callbackURL: { type: "string" },
                  },
                  required: ["email", "password"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Signed in — session cookie set",
              content: { "application/json": { schema: { type: "object" } } },
            },
            400: { description: "Invalid credentials or request body" },
          },
        },
      },
      "/api/auth/get-session": {
        get: {
          tags: ["Authentication"],
          summary: "Get current session",
          description: "Returns the current session/user or null. Public.",
          responses: { 200: { description: "Current session (or null)" } },
        },
      },
      "/api/auth/sign-out": {
        post: {
          tags: ["Authentication"],
          summary: "Sign out",
          description: "Clears the session cookie. Public.",
          responses: { 200: { description: "Signed out" } },
        },
      },
    },
  },
});

// Convenience envelope builders bound to entity schemas.
export const responses = {
  department: apiResponse(departmentSchema),
  departmentList: apiListResponse(departmentSchema),
  service: apiResponse(serviceSchema),
  serviceList: apiListResponse(serviceSchema),
  technology: apiResponse(technologySchema),
  technologyList: apiListResponse(technologySchema),
  team: apiResponse(teamSchema),
  teamList: apiListResponse(teamSchema),
  teamMember: apiResponse(teamMemberSchema),
  teamMemberList: apiSuccessList(teamMemberSchema),
  user: apiResponse(userWithRelationsSchema),
  userList: apiListResponse(userWithRelationsSchema),
  project: apiResponse(projectSchema),
  projectList: apiListResponse(projectSchema),
  projectLogList: apiSuccessList(projectLogSchema),
  caseStudy: apiResponse(caseStudySchema),
  caseStudyList: apiListResponse(caseStudySchema),
  testimonial: apiResponse(testimonialSchema),
  testimonialList: apiListResponse(testimonialSchema),
  document: apiResponse(documentSchema),
  documentList: apiListResponse(documentSchema),
  documentDownload: apiResponse(documentDownloadSchema),
  task: apiResponse(taskSchema),
  taskList: apiListResponse(taskSchema),
  client: apiResponse(clientSchema),
  clientList: apiListResponse(clientSchema),
  dashboard: apiResponse(dashboardSchema),
  deleted: apiResponse(t.Any()),
  error: errorResponse,
};
