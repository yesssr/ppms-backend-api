import { t } from "elysia";
import { CONTENT_STATUS } from "../../constant/enum.js";

export const caseStudyPaginationQuery = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
});

export const caseStudyParams = t.Object({
  id: t.String({ format: "uuid" }),
});

export const caseStudyBody = t.Object({
  projectId: t.String({ format: "uuid" }),
  title: t.String({ minLength: 1, maxLength: 150 }),
  slug: t.String({ minLength: 1, maxLength: 150 }),
  challenge: t.String({ minLength: 1, maxLength: 2000 }),
  solution: t.String({ minLength: 1, maxLength: 2000 }),
  outcome: t.String({ minLength: 1, maxLength: 2000 }),
  coverImage: t.Optional(t.String({ maxLength: 500 })),
  status: t.Union([
    t.Literal("draft"),
    t.Literal("published"),
    t.Literal("archived"),
  ]),
  tags: t.Optional(t.String({ maxLength: 500 })),
  publishedAt: t.Optional(t.String()),
});

export const updateCaseStudyBody = t.Object({
  title: t.Optional(t.String({ minLength: 1, maxLength: 150 })),
  slug: t.Optional(t.String({ minLength: 1, maxLength: 150 })),
  challenge: t.Optional(t.String({ minLength: 1, maxLength: 2000 })),
  solution: t.Optional(t.String({ minLength: 1, maxLength: 2000 })),
  outcome: t.Optional(t.String({ minLength: 1, maxLength: 2000 })),
  coverImage: t.Optional(t.String({ maxLength: 500 })),
  status: t.Optional(t.Union([
    t.Literal("draft"),
    t.Literal("published"),
    t.Literal("archived"),
  ])),
  tags: t.Optional(t.String({ maxLength: 500 })),
  publishedAt: t.Optional(t.String()),
});

export type CaseStudyPaginationQuery = typeof caseStudyPaginationQuery.$infer;
export type CaseStudyParams = typeof caseStudyParams.$infer;
export type CaseStudyBody = typeof caseStudyBody.$infer;
export type UpdateCaseStudyBody = typeof updateCaseStudyBody.$infer;
