import { t } from "elysia";
import type { NewTechnology } from "./schema.js";
import { TECH_CATEGORIES, type TechnologyCategory } from "../../constant/enum.js";

export const technologyPaginationQuery = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
});

export const technologyParams = t.Object({
  id: t.String({ format: "uuid" }),
});

export const technologyBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  category: t.String({ minLength: 1, maxLength: 50 }),
  isActive: t.Optional(t.Boolean()),
});

export type TechnologyPaginationQuery = typeof technologyPaginationQuery.$infer;
export type TechnologyParams = typeof technologyParams.$infer;
export type TechnologyBody = typeof technologyBody.$infer;
export type TechnologyUpdateBody = {
  name?: string;
  category?: TechnologyCategory;
  isActive?: boolean;
};
