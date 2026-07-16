import { db } from "../../db/index.js";
import { document, NewDocument, Document } from "./schema.js";
import { eq, count } from "drizzle-orm";
import { NotFoundError } from "../../utils/errors.js";
import {
  PaginationParams,
  PaginatedResult,
  paginate,
  getPaginationOffset,
} from "../../utils/pagination.js";

export type { Document, NewDocument } from "./schema.js";

export const getDocuments = async (
  params: PaginationParams
): Promise<PaginatedResult<Document>> => {
  const offset = getPaginationOffset(params.page, params.limit);

  const [items, countResult] = await Promise.all([
    db.select().from(document).limit(params.limit).offset(offset),
    db.select({ count: count() }).from(document),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return paginate(items, total, params);
};

export const getDocumentById = async (id: string): Promise<Document> => {
  const [result] = await db
    .select()
    .from(document)
    .where(eq(document.id, id))
    .limit(1);

  if (!result) {
    throw NotFoundError("Document not found", "DOCUMENT_NOT_FOUND");
  }

  return result;
};

export const createDocument = async (data: NewDocument): Promise<Document> => {
  const [result] = await db.insert(document).values(data).returning();
  return result;
};

export const updateDocument = async (
  id: string,
  data: Partial<NewDocument>
): Promise<Document> => {
  const [result] = await db
    .update(document)
    .set(data)
    .where(eq(document.id, id))
    .returning();

  if (!result) {
    throw NotFoundError("Document not found", "DOCUMENT_NOT_FOUND");
  }

  return result;
};

export const deleteDocument = async (id: string): Promise<void> => {
  const [result] = await db
    .delete(document)
    .where(eq(document.id, id))
    .returning();

  if (!result) {
    throw NotFoundError("Document not found", "DOCUMENT_NOT_FOUND");
  }
};
