import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  documentPaginationQuery,
  documentParams,
  documentBody,
  updateDocumentBody,
} from "./validation.js";

export const documentRoutes = new Elysia({ name: "documents" })
  .get("/", ctrl.listDocuments, { query: documentPaginationQuery })
  .get("/:id", ctrl.getDocument, { params: documentParams })
  .post("/", ctrl.createDocument, { body: documentBody })
  .put("/:id", ctrl.updateDocument, {
    params: documentParams,
    body: updateDocumentBody,
  })
  .delete("/:id", ctrl.deleteDocument, { params: documentParams });
