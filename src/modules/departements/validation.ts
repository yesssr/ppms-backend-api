import { t } from "elysia";
import type { NewDepartment } from "./schema.js";

export const departmentPaginationQuery = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
});

export const departmentParams = t.Object({
  id: t.String({ format: "uuid" }),
});

export const departmentBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  description: t.Optional(t.String({ maxLength: 500 })),
});

export type DepartmentPaginationQuery = typeof departmentPaginationQuery.$infer;
export type DepartmentParams = typeof departmentParams.$infer;
export type DepartmentBody = typeof departmentBody.$infer;
export type DepartmentUpdateBody = {
  name?: string;
  description?: string;
};
