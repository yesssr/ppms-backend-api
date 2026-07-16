import { success, successWithMeta, error } from "../../utils/response.js";
import {
  getDocuments,
  getDocumentById,
  createDocument as createDocumentSvc,
  updateDocument as updateDocumentSvc,
  deleteDocument as deleteDocumentSvc,
} from "./service.js";
import { getPaginationParams } from "../../utils/pagination.js";
import type {
  DocumentPaginationQuery,
  DocumentParams,
  DocumentBody,
  UpdateDocumentBody,
} from "./validation.js";

export async function listDocuments(context: { query: DocumentPaginationQuery }) {
  try {
    const { page, limit } = getPaginationParams(
      context.query.page,
      context.query.limit
    );
    const result = await getDocuments({ page, limit });
    return successWithMeta(result.data, result.meta, "Documents retrieved successfully");
  } catch (err) {
    return error("Failed to retrieve documents", "FETCH_DOCUMENTS_ERROR");
  }
}

export async function getDocument(context: { params: DocumentParams }) {
  try {
    const document = await getDocumentById(context.params.id);
    return success(document, "Document retrieved successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Document not found", "DOCUMENT_NOT_FOUND");
    }
    return error("Failed to retrieve document", "FETCH_DOCUMENT_ERROR");
  }
}

export async function createDocument(context: { body: DocumentBody }) {
  try {
    const document = await createDocumentSvc(context.body);
    return success(document, "Document created successfully");
  } catch (err) {
    console.error("CREATE DOCUMENT ERROR", err);
    return error("Failed to create document", "CREATE_DOCUMENT_ERROR");
  }
}

export async function updateDocument(context: {
  params: DocumentParams;
  body: UpdateDocumentBody;
}) {
  try {
    const document = await updateDocumentSvc(context.params.id, context.body);
    return success(document, "Document updated successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Document not found", "DOCUMENT_NOT_FOUND");
    }
    return error("Failed to update document", "UPDATE_DOCUMENT_ERROR");
  }
}

export async function deleteDocument(context: { params: DocumentParams }) {
  try {
    await deleteDocumentSvc(context.params.id);
    return success(null, "Document deleted successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Document not found", "DOCUMENT_NOT_FOUND");
    }
    return error("Failed to delete document", "DELETE_DOCUMENT_ERROR");
  }
}
