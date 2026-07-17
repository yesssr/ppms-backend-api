import { t, type TSchema } from "elysia";
import { USER_ROLES } from "../../constant/enum.js";

// Build a t.Union of t.Literal from a readonly string tuple so the validated
// values always match the canonical lists in constant/enum.ts.
const enumUnion = (values: readonly string[]) =>
  t.Union(values.map((v) => t.Literal(v)) as unknown as [TSchema, ...TSchema[]]);

export const userPaginationQuery = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
});

export const userParams = t.Object({
  id: t.String(),
});

export const createUserBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8, maxLength: 100 }),
  role: t.Optional(enumUnion(USER_ROLES)),
  departmentId: t.Optional(t.String({ format: "uuid" })),
  isActive: t.Optional(t.Boolean()),
  teamIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
  projectIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
});

export const updateUserBody = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
  email: t.Optional(t.String({ format: "email" })),
  role: t.Optional(enumUnion(USER_ROLES)),
  departmentId: t.Optional(t.String({ format: "uuid" })),
  isActive: t.Optional(t.Boolean()),
  teamIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
  projectIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
});

export type UserPaginationQuery = typeof userPaginationQuery.$infer;
export type UserParams = typeof userParams.$infer;
export type CreateUserBody = typeof createUserBody.$infer;
export type UpdateUserBody = typeof updateUserBody.$infer;
