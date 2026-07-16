import { t } from "elysia";
import { CONTENT_STATUS } from "../../constant/enum.js";

export const testimonialPaginationQuery = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
});

export const testimonialParams = t.Object({
  id: t.String({ format: "uuid" }),
});

export const testimonialBody = t.Object({
  projectId: t.String({ format: "uuid" }),
  clientName: t.String({ minLength: 1, maxLength: 100 }),
  rating: t.Number({ minimum: 1, maximum: 5 }),
  message: t.String({ minLength: 1, maxLength: 2000 }),
  status: t.Union([
    t.Literal("draft"),
    t.Literal("published"),
    t.Literal("archived"),
  ]),
});

export const updateTestimonialBody = t.Object({
  clientName: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
  rating: t.Optional(t.Number({ minimum: 1, maximum: 5 })),
  message: t.Optional(t.String({ minLength: 1, maxLength: 2000 })),
  status: t.Optional(t.Union([
    t.Literal("draft"),
    t.Literal("published"),
    t.Literal("archived"),
  ])),
});

export type TestimonialPaginationQuery = typeof testimonialPaginationQuery.$infer;
export type TestimonialParams = typeof testimonialParams.$infer;
export type TestimonialBody = typeof testimonialBody.$infer;
export type UpdateTestimonialBody = typeof updateTestimonialBody.$infer;
