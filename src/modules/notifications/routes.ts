import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  notificationPaginationQuery,
  notificationParams,
  updateFcmTokenBody,
  testPushBody,
} from "./validation.js";
import { responses } from "../../docs/openapi.js";
import { sendPushNotification } from "./fcm.js";
import { success, error } from "../../utils/response.js";

export const notificationRoutes = new Elysia({ name: "notifications", prefix: "/api/notifications" })
  .get("/", ctrl.listNotifications, {
    query: notificationPaginationQuery,
    response: responses.notificationList,
    detail: {
      tags: ["Notifications"],
      summary: "List user notifications",
      description: "Returns a paginated list of notifications for the current user. **Developer.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .get("/unread-count", ctrl.getUnreadCountHandler, {
    response: responses.unreadCount,
    detail: {
      tags: ["Notifications"],
      summary: "Get unread notification count",
      description: "Returns the count of unread notifications for the current user. **Developer.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .put("/:id/read", ctrl.markNotificationAsRead, {
    params: notificationParams,
    response: responses.notification,
    detail: {
      tags: ["Notifications"],
      summary: "Mark notification as read",
      description: "Marks a specific notification as read. **Developer.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .put("/read-all", ctrl.markAllNotificationsAsRead, {
    response: responses.markAllRead,
    detail: {
      tags: ["Notifications"],
      summary: "Mark all notifications as read",
      description: "Marks all notifications as read for the current user. **Developer.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .delete("/:id", ctrl.deleteNotificationHandler, {
    params: notificationParams,
    response: responses.deleted,
    detail: {
      tags: ["Notifications"],
      summary: "Delete a notification",
      description: "Deletes a specific notification. **Developer.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .put("/fcm-token", ctrl.updateFcmToken, {
    body: updateFcmTokenBody,
    response: responses.deleted,
    detail: {
      tags: ["Notifications"],
      summary: "Update FCM token",
      description: "Updates the FCM push notification token for the current user. **Developer.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .post("/test-push", async ({ body }) => {
    const { fcmToken, title, message } = body as { fcmToken: string; title?: string; message?: string };

    if (!fcmToken) {
      return error("FCM token required", "MISSING_TOKEN");
    }

    const result = await sendPushNotification(
      [fcmToken],
      title || "Test Push",
      message || "This is a test push notification from PPMS",
      { type: "test" }
    );

    if (result.success === 0) {
      return error("Push failed", "PUSH_FAILED", result);
    }

    return success(result, "Push sent");
  }, {
    body: testPushBody,
    response: {
      200: success(t.Any()),
      400: responses.error,
    },
    detail: {
      tags: ["Notifications"],
      summary: "Test push notification",
      description: "Sends a test push notification to a specific FCM token. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  });