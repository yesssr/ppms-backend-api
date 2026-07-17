import { t, type TSchema } from "elysia";
import { TECH_CATEGORIES } from "../../constant/enum.js";

const enumUnion = (values: readonly string[]) =>
  t.Union(
    values.map((v) => t.Literal(v)) as unknown as [TSchema, ...TSchema[]]
  );

export const technologyPaginationQuery = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
  search: t.Optional(t.String()),
  category: t.Optional(enumUnion(TECH_CATEGORIES)),
});

export const technologyParams = t.Object({
  id: t.String({ format: "uuid" }),
});

export const technologyBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  category: enumUnion(TECH_CATEGORIES),
  isActive: t.Optional(t.Boolean()),
});

export const technologyUpdateBody = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
  category: t.Optional(enumUnion(TECH_CATEGORIES)),
  isActive: t.Optional(t.Boolean()),
});

export type TechnologyPaginationQuery = typeof technologyPaginationQuery.$infer;
export type TechnologyParams = typeof technologyParams.$infer;
export type TechnologyBody = typeof technologyBody.$infer;
export type TechnologyUpdateBody = typeof technologyUpdateBody.$infer;
