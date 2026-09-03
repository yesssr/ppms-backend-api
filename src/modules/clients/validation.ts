import { t } from "elysia";
import type { NewClient } from "./schema.js";

export const clientPaginationQuery = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
  search: t.Optional(t.String()),
});

export const clientParams = t.Object({
  id: t.String({ format: "uuid" }),
});

export const clientBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 150 }),
  email: t.Optional(t.String({ maxLength: 255 })),
  phone: t.Optional(t.String({ maxLength: 50 })),
  address: t.Optional(t.String({ maxLength: 500 })),
});

export type ClientPaginationQuery = typeof clientPaginationQuery.$infer;
export type ClientParams = typeof clientParams.$infer;
export type ClientBody = typeof clientBody.$infer;
export type ClientUpdateBody = {
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};
