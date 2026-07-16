import { t } from "elysia";
import { DOCUMENT_CATEGORY } from "../../constant/enum.js";

export const documentPaginationQuery = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
});

export const documentParams = t.Object({
  id: t.String({ format: "uuid" }),
});

export const documentBody = t.Object({
  projectId: t.String({ format: "uuid" }),
  uploadedBy: t.String(),
  fileName: t.String({ minLength: 1, maxLength: 255 }),
  fileKey: t.String({ minLength: 1, maxLength: 500 }),
  mimeType: t.String({ minLength: 1, maxLength: 100 }),
  fileSize: t.Number({ minimum: 0 }),
  category: t.Union([
    t.Literal("requirement"),
    t.Literal("design"),
    t.Literal("contract"),
    t.Literal("report"),
    t.Literal("other"),
  ]),
});

export const updateDocumentBody = t.Object({
  fileName: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
  category: t.Optional(t.Union([
    t.Literal("requirement"),
    t.Literal("design"),
    t.Literal("contract"),
    t.Literal("report"),
    t.Literal("other"),
  ])),
});

export type DocumentPaginationQuery = typeof documentPaginationQuery.$infer;
export type DocumentParams = typeof documentParams.$infer;
export type DocumentBody = typeof documentBody.$infer;
export type UpdateDocumentBody = typeof updateDocumentBody.$infer;
