import { t, TSchema } from "elysia";
import { CONTENT_STATUS } from "../../constant/enum.js";

const enumUnion = (values: readonly string[]) =>
  t.Union(
    values.map((v) => t.Literal(v)) as unknown as [TSchema, ...TSchema[]]
  );

export const testimonialPaginationQuery = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
  search: t.Optional(t.String()),
  status: enumUnion(CONTENT_STATUS),
});

export const testimonialParams = t.Object({
  id: t.String({ format: "uuid" }),
});

export const testimonialBody = t.Object({
  projectId: t.String({ format: "uuid" }),
  clientName: t.String({ minLength: 1, maxLength: 100 }),
  rating: t.Number({ minimum: 1, maximum: 5 }),
  message: t.String({ minLength: 1, maxLength: 2000 }),
  status: enumUnion(CONTENT_STATUS),
});

export const updateTestimonialBody = t.Object({
  clientName: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
  rating: t.Optional(t.Number({ minimum: 1, maximum: 5 })),
  message: t.Optional(t.String({ minLength: 1, maxLength: 2000 })),
  status: t.Optional(enumUnion(CONTENT_STATUS)),
});

export type TestimonialPaginationQuery =
  typeof testimonialPaginationQuery.$infer;
export type TestimonialParams = typeof testimonialParams.$infer;
export type TestimonialBody = typeof testimonialBody.$infer;
export type UpdateTestimonialBody = typeof updateTestimonialBody.$infer;
