import { t } from "elysia";

export const servicePaginationQuery = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
  search: t.Optional(t.String()),
});

export const serviceParams = t.Object({
  id: t.String({ format: "uuid" }),
});

export const serviceBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  description: t.Optional(t.String({ maxLength: 500 })),
});

export type ServicePaginationQuery = typeof servicePaginationQuery.$infer;
export type ServiceParams = typeof serviceParams.$infer;
export type ServiceBody = typeof serviceBody.$infer;
export type ServiceUpdateBody = {
  name?: string;
  description?: string;
};
