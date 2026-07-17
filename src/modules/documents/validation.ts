import { t, type TSchema } from "elysia";
import { DOCUMENT_CATEGORY } from "../../constant/enum.js";

const enumUnion = (values: readonly string[]) =>
  t.Union(
    values.map((v) => t.Literal(v)) as unknown as [TSchema, ...TSchema[]]
  );

export const documentPaginationQuery = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
  search: t.Optional(t.String()),
  category: t.Optional(enumUnion(DOCUMENT_CATEGORY)),
  projectId: t.Optional(t.String({ format: "uuid" })),
});

export const documentParams = t.Object({
  id: t.String({ format: "uuid" }),
});

export const documentBody = t.Object({
  projectId: t.String({ format: "uuid" }),
  uploadedBy: t.String(),
  file: t.File(),
  category: enumUnion(DOCUMENT_CATEGORY),
});

export const updateDocumentBody = t.Object({
  file: t.Optional(t.File()),
  category: t.Optional(enumUnion(DOCUMENT_CATEGORY)),
});

export type DocumentPaginationQuery = typeof documentPaginationQuery.$infer;
export type DocumentParams = typeof documentParams.$infer;
export type DocumentBody = typeof documentBody.$infer;
export type UpdateDocumentBody = typeof updateDocumentBody.$infer;
