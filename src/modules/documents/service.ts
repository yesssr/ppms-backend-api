import { db } from "../../db/index.js";
import { document, NewDocument, Document } from "./schema.js";
import { eq, count, ilike, and } from "drizzle-orm";
import { NotFoundError } from "../../utils/errors.js";
import {
  PaginationParams,
  PaginatedResult,
  paginate,
  getPaginationOffset,
} from "../../utils/pagination.js";
import { storageService } from "../../utils/storage.js";

export type { Document, NewDocument } from "./schema.js";

// Selects everything except the internal fileKey. The fileKey must never be
// returned to clients — downloads go through a signed URL instead.
const documentResponse = {
  id: document.id,
  projectId: document.projectId,
  uploadedBy: document.uploadedBy,
  fileName: document.fileName,
  mimeType: document.mimeType,
  fileSize: document.fileSize,
  category: document.category,
  createdAt: document.createdAt,
  updatedAt: document.updatedAt,
} as const;

export const getDocuments = async (
  params: PaginationParams & { search?: string; category?: string; projectId?: string }
): Promise<PaginatedResult<Omit<Document, "fileKey">>> => {
  const offset = getPaginationOffset(params.page, params.limit);

  const conditions = [];

  if (params.search) {
    conditions.push(ilike(document.fileName, `%${params.search}%`));
  }

  if (params.category) {
    conditions.push(eq(document.category, params.category));
  }

  if (params.projectId) {
    conditions.push(eq(document.projectId, params.projectId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, countResult] = await Promise.all([
    db.select(documentResponse).from(document).where(whereClause).limit(params.limit).offset(offset),
    db.select({ count: count() }).from(document).where(whereClause),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return paginate(items, total, params);
};

export const getDocumentById = async (id: string): Promise<Omit<Document, "fileKey">> => {
  const [result] = await db
    .select(documentResponse)
    .from(document)
    .where(eq(document.id, id))
    .limit(1);

  if (!result) {
    throw NotFoundError("Document not found", "DOCUMENT_NOT_FOUND");
  }

  return result;
};

// Returns a short-lived signed URL the client can use to download the file
// directly from object storage. The fileKey itself is never exposed.
export const getDocumentDownload = async (id: string): Promise<{ downloadUrl: string }> => {
  const [result] = await db
    .select({ fileKey: document.fileKey })
    .from(document)
    .where(eq(document.id, id))
    .limit(1);

  if (!result) {
    throw NotFoundError("Document not found", "DOCUMENT_NOT_FOUND");
  }

  const downloadUrl = await storageService.generateSignedUrl(result.fileKey, 300);
  return { downloadUrl };
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
  const [result] = await db.delete(document).where(eq(document.id, id)).returning();

  if (!result) {
    throw NotFoundError("Document not found", "DOCUMENT_NOT_FOUND");
  }
};
