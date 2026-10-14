import { success, successWithMeta, error } from "../../utils/response.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "./service.js";
import { getPaginationParams } from "../../utils/pagination.js";
import type {
  NotificationPaginationQuery,
  NotificationParams,
  UpdateFcmTokenBody,
} from "./validation.js";
import { db } from "../../db/index.js";
import { user } from "../auth/schema.js";
import { eq } from "drizzle-orm";

interface AuthUser {
  id: string;
  role: string;
  email: string;
  name: string;
}

type AuthContext = {
  query?: NotificationPaginationQuery;
  params?: NotificationParams;
  body?: UpdateFcmTokenBody;
  user?: AuthUser;
};

function getUserId(context: AuthContext): string {
  const userId = context.user?.id;
  if (!userId) throw new Error("User not authenticated");
  return userId;
}

export async function listNotifications(context: AuthContext) {
  try {
    const userId = getUserId(context);
    const { page, limit } = getPaginationParams(context.query?.page, context.query?.limit);
    const result = await getNotifications(userId, { page, limit });
    return successWithMeta(result.data, result.meta, "Notifications retrieved successfully");
  } catch (err) {
    return error("Failed to retrieve notifications", "FETCH_NOTIFICATIONS_ERROR");
  }
}

export async function getUnreadCountHandler(context: AuthContext) {
  try {
    const userId = getUserId(context);
    const count = await getUnreadCount(userId);
    return success({ count }, "Unread count retrieved successfully");
  } catch (err) {
    return error("Failed to retrieve unread count", "FETCH_UNREAD_COUNT_ERROR");
  }
}

export async function markNotificationAsRead(context: AuthContext) {
  try {
    const userId = getUserId(context);
    const notif = await markAsRead(userId, context.params!.id);
    return success(notif, "Notification marked as read");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Notification not found", "NOTIFICATION_NOT_FOUND");
    }
    return error("Failed to mark notification as read", "MARK_READ_ERROR");
  }
}

export async function markAllNotificationsAsRead(context: AuthContext) {
  try {
    const userId = getUserId(context);
    const count = await markAllAsRead(userId);
    return success({ count }, "All notifications marked as read");
  } catch (err) {
    return error("Failed to mark all notifications as read", "MARK_ALL_READ_ERROR");
  }
}

export async function deleteNotificationHandler(context: AuthContext) {
  try {
    const userId = getUserId(context);
    await deleteNotification(userId, context.params!.id);
    return success(null, "Notification deleted successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Notification not found", "NOTIFICATION_NOT_FOUND");
    }
    return error("Failed to delete notification", "DELETE_NOTIFICATION_ERROR");
  }
}

export async function updateFcmToken(context: AuthContext) {
  try {
    const userId = getUserId(context);
    await db.update(user).set({ fcmToken: context.body!.fcmToken }).where(eq(user.id, userId));
    return success(null, "FCM token updated successfully");
  } catch (err) {
    return error("Failed to update FCM token", "UPDATE_FCM_TOKEN_ERROR");
  }
}