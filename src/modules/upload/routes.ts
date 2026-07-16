import { Elysia } from "elysia";
import { t } from "elysia";
import { storageService } from "../../utils/storage.js";

export const uploadRoutes = new Elysia({ name: "upload" })
  .post("/image", async (context: { body: { file: File; prefix?: string } }) => {
    const file = context.body.file;
    const prefix = context.body.prefix || "uploads";

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = storageService.generateKey(prefix, file.name);
    const publicUrl = await storageService.upload(key, buffer, file.type);

    return {
      success: true,
      data: {
        key,
        publicUrl,
      },
    };
  }, {
    body: t.Object({
      file: t.File(),
      prefix: t.Optional(t.String()),
    }),
  })
  .post("/document", async (context: { body: { file: File; projectId?: string; category?: string } }) => {
    const file = context.body.file;
    const projectId = context.body.projectId;
    const category = context.body.category || "other";

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = storageService.generateKey("documents", file.name);
    const publicUrl = await storageService.upload(key, buffer, file.type);

    return {
      success: true,
      data: {
        key,
        publicUrl,
        fileName: file.name,
        mimeType: file.type,
        fileSize: buffer.length,
        projectId,
        category,
      },
    };
  }, {
    body: t.Object({
      file: t.File(),
      projectId: t.Optional(t.String({ format: "uuid" })),
      category: t.Optional(t.String()),
    }),
  });
