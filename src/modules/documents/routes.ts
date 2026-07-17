import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  documentPaginationQuery,
  documentParams,
  documentBody,
  updateDocumentBody,
} from "./validation.js";
import { responses } from "../../docs/openapi.js";

export const documentRoutes = new Elysia({ name: "documents", prefix: "/api/documents" })
  .get("/", ctrl.listDocuments, {
    query: documentPaginationQuery,
    response: responses.documentList,
    detail: {
      tags: ["Documents"],
      summary: "List documents",
      description: "Returns a paginated list of documents. **Developer.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .get("/:id", ctrl.getDocument, {
    params: documentParams,
    response: responses.document,
    detail: {
      tags: ["Documents"],
      summary: "Get a document by ID",
      description: "Returns a single document. **Developer.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .post("/", ctrl.createDocument, {
    body: documentBody,
    response: responses.document,
    detail: {
      tags: ["Documents"],
      summary: "Create a document",
      description:
        "Registers document metadata and uploads the file in a single request via object storage. **Developer.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .put("/:id", ctrl.updateDocument, {
    params: documentParams,
    body: updateDocumentBody,
    response: responses.document,
    detail: {
      tags: ["Documents"],
      summary: "Update a document",
      description: "Updates document metadata. **Developer.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .delete("/:id", ctrl.deleteDocument, {
    params: documentParams,
    response: responses.deleted,
    detail: {
      tags: ["Documents"],
      summary: "Delete a document",
      description: "Deletes a document. **Developer.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .get("/:id/download", ctrl.downloadDocument, {
    params: documentParams,
    response: responses.documentDownload,
    detail: {
      tags: ["Documents"],
      summary: "Get a document download URL",
      description:
        "Returns a short-lived signed URL so the client can download the file directly from object storage. The internal fileKey is never exposed. **Developer.**",
      security: [{ sessionCookie: [] }],
    },
  });
