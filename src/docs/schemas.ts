import { t, type TSchema } from "elysia";
import {
  USER_ROLES,
  TECH_CATEGORIES,
  PROJECT_STATUS,
  TASK_PRIORITY,
  TASK_STATUS,
  DOCUMENT_CATEGORY,
  CONTENT_STATUS,
} from "../constant/enum.js";

// Build a t.Union of t.Literal from a readonly string tuple so the OpenAPI
// docs expose the same allowed values enforced in backend code (constant/enum.ts).
const enumUnion = (values: readonly string[]) =>
  t.Union(
    values.map((v) => t.Literal(v)) as unknown as [TSchema, ...TSchema[]]
  );

// ---------------------------------------------------------------------------
// Standard API envelope (see SYSTEM_MAP.md "API Response Format")
// ---------------------------------------------------------------------------

export const errorSchema = t.Object(
  {
    message: t.String(),
    code: t.String(),
    details: t.Optional(t.Any()),
  },
  { description: "Error payload returned when a request fails" }
);

export const metaSchema = t.Object(
  {
    page: t.Number(),
    limit: t.Number(),
    total: t.Number(),
    totalPages: t.Number(),
  },
  { description: "Pagination metadata for list endpoints" }
);

// Build a success response schema for a single entity.
// Note: `error`/`meta` use t.Any() (not t.Null()) because Elysia's runtime
// response validation rejects t.Null() in the envelope, producing spurious
// 422s even when the actual payload is correct.
export const success = (data: TSchema): any =>
  t.Object({
    success: t.Boolean({ description: "Always true on success" }),
    data,
    message: t.String({ description: "Human-readable status message" }),
    error: t.Any({ description: "null on success" }),
    meta: t.Optional(t.Any()),
  });

// Build a paginated list response (matches the actual `paginate()` return shape
// used by list controllers: { data: T[], meta }).
export const listResult = (item: TSchema): any =>
  t.Object({
    data: t.Array(item),
    meta: metaSchema,
  });

// Build a success response where data is an array wrapped in the standard
// envelope (used by controllers that return success([...])).
export const successList = (item: TSchema): any =>
  t.Object({
    success: t.Boolean({ description: "Always true on success" }),
    data: t.Array(item),
    message: t.String({ description: "Human-readable status message" }),
    error: t.Any({ description: "null on success" }),
    meta: t.Optional(t.Any()),
  });

export const errorResponse: any = t.Object({
  success: t.Boolean({ description: "Always false on failure" }),
  data: t.Any(),
  message: t.String({ description: "Human-readable error message" }),
  error: errorSchema,
  meta: t.Optional(t.Any()),
});

// ---------------------------------------------------------------------------
// Entity response schemas (mirror of DB columns)
// ---------------------------------------------------------------------------

export const departmentSchema = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.Union([t.String(), t.Null()]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const serviceSchema = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.Union([t.String(), t.Null()]),
  isActive: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const technologySchema = t.Object({
  id: t.String(),
  name: t.String(),
  category: enumUnion(TECH_CATEGORIES),
  isActive: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const teamSchema = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.Union([t.String(), t.Null()]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const teamMemberSchema = t.Object({
  teamId: t.String(),
  userId: t.String(),
  joinedAt: t.Date(),
});

export const userSchema = t.Object({
  id: t.String(),
  departmentId: t.Union([t.String(), t.Null()]),
  name: t.String(),
  email: t.String(),
  role: enumUnion(USER_ROLES),
  isActive: t.Boolean(),
  emailVerified: t.Boolean(),
  image: t.Union([t.String(), t.Null()]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

// User plus embedded department + teams (returned by GET /api/users and
// GET /api/users/:id). `department` is null when the user has none.
export const userWithRelationsSchema = t.Object({
  ...userSchema.properties,
  department: t.Union([departmentSchema, t.Null()]),
  teams: t.Array(teamSchema),
});

export const projectSchema = t.Object({
  id: t.String(),
  serviceId: t.String(),
  createdBy: t.String(),
  name: t.String(),
  clientName: t.String(),
  description: t.Union([t.String(), t.Null()]),
  repositoryUrl: t.Union([t.String(), t.Null()]),
  demoUrl: t.Union([t.String(), t.Null()]),
  thumbnail: t.Union([t.String(), t.Null()]),
  code: t.Union([t.String(), t.Null()]),
  status: enumUnion(PROJECT_STATUS),
  progressPercentage: t.Number(),
  lastChange: t.Date(),
  budget: t.Union([t.String(), t.Null()]),
  startDate: t.Union([t.String(), t.Null()]),
  endDate: t.Union([t.String(), t.Null()]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const projectLogSchema = t.Object({
  id: t.String(),
  projectId: t.String(),
  progressPercentage: t.Number(),
  message: t.Union([t.String(), t.Null()]),
  updatedBy: t.Union([t.String(), t.Null()]),
  createdAt: t.Date(),
});

export const caseStudySchema = t.Object({
  id: t.String(),
  projectId: t.String(),
  title: t.String(),
  slug: t.Union([t.String(), t.Null()]),
  challenge: t.Union([t.String(), t.Null()]),
  solution: t.Union([t.String(), t.Null()]),
  outcome: t.Union([t.String(), t.Null()]),
  coverImage: t.Union([t.String(), t.Null()]),
  status: enumUnion(CONTENT_STATUS),
  tags: t.Union([t.String(), t.Null()]),
  publishedAt: t.Union([t.String(), t.Null()]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const testimonialSchema = t.Object({
  id: t.String(),
  projectId: t.String(),
  clientName: t.String(),
  rating: t.Number(),
  message: t.String(),
  status: enumUnion(CONTENT_STATUS),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const documentSchema = t.Object({
  id: t.String(),
  projectId: t.String(),
  uploadedBy: t.String(),
  fileName: t.String(),
  mimeType: t.String(),
  fileSize: t.Number(),
  category: enumUnion(DOCUMENT_CATEGORY),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

// Download response: a short-lived signed URL only. The internal fileKey is
// never returned to clients.
export const documentDownloadSchema = t.Object({
  downloadUrl: t.String(),
});

export const taskSchema = t.Object({
  id: t.String(),
  projectId: t.String(),
  assigneeId: t.String(),
  createdBy: t.String(),
  title: t.String(),
  description: t.Union([t.String(), t.Null()]),
  priority: enumUnion(TASK_PRIORITY),
  status: enumUnion(TASK_STATUS),
  startDate: t.Union([t.String(), t.Null()]),
  dueDate: t.Union([t.String(), t.Null()]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});
