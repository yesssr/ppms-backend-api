import { t, type TSchema } from "elysia";

const enumUnion = (values: readonly string[]) =>
  t.Union(values.map((v) => t.Literal(v)) as unknown as [TSchema, ...TSchema[]]);

import { NOTIFICATION_TYPES } from "./schema.js";

export const notificationPaginationQuery = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
  isRead: t.Optional(t.Boolean()),
});

export const notificationParams = t.Object({
  id: t.String({ format: "uuid" }),
});

export const updateFcmTokenBody = t.Object({
  fcmToken: t.String({ minLength: 1 }),
});

export const testPushBody = t.Object({
  fcmToken: t.String({ minLength: 1 }),
  title: t.Optional(t.String()),
  message: t.Optional(t.String()),
});

export type NotificationPaginationQuery = typeof notificationPaginationQuery.$infer;
export type NotificationParams = typeof notificationParams.$infer;
export type UpdateFcmTokenBody = typeof updateFcmTokenBody.$infer;
export type TestPushBody = typeof testPushBody.$infer;