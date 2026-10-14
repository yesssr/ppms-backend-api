import { db } from "../../db/index.js";
import { notification, NewNotification, Notification, NOTIFICATION_TYPES, NotificationType } from "./schema.js";
import { user } from "../auth/schema.js";
import { eq, and, lt, sql, inArray } from "drizzle-orm";
import { NotFoundError } from "../../utils/errors.js";
import {
  PaginationParams,
  PaginatedResult,
  paginate,
  getPaginationOffset,
} from "../../utils/pagination.js";
import { sendPushNotification, initializeFirebase } from "./fcm.js";
import { config } from "../../config/conf.js";

const NOTIFICATION_TTL_DAYS = 30;

const calculateExpiresAt = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() + NOTIFICATION_TTL_DAYS);
  return date;
};

export const createNotification = async (
  data: Omit<NewNotification, "id" | "createdAt" | "expiresAt" | "sentAt"> & { expiresAt?: Date }
): Promise<Notification> => {
  const [result] = await db
    .insert(notification)
    .values({
      ...data,
      expiresAt: data.expiresAt ?? calculateExpiresAt(),
    })
    .returning();
  return result;
};

export const createAndSendNotification = async (
  userId: string,
  title: string,
  body: string,
  type: NotificationType,
  referenceId?: string,
  referenceType?: string
): Promise<Notification | null> => {
  const notif = await createNotification({
    userId,
    title,
    body,
    type,
    referenceId,
    referenceType,
  });

  const [userRow] = await db
    .select({ fcmToken: user.fcmToken })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (userRow?.fcmToken) {
    await sendPushNotification([userRow.fcmToken], title, body, {
      type,
      referenceId: referenceId || "",
      referenceType: referenceType || "",
      notificationId: notif.id,
    });
  }

  return notif;
};

export const getNotifications = async (
  userId: string,
  params: PaginationParams
): Promise<PaginatedResult<Notification>> => {
  const offset = getPaginationOffset(params.page, params.limit);

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(notification)
      .where(eq(notification.userId, userId))
      .orderBy(notification.createdAt)
      .limit(params.limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(notification)
      .where(eq(notification.userId, userId)),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  return paginate(items, total, params);
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notification)
    .where(and(eq(notification.userId, userId), eq(notification.isRead, false)));
  return Number(result?.count ?? 0);
};

export const markAsRead = async (userId: string, notificationId: string): Promise<Notification> => {
  const [result] = await db
    .update(notification)
    .set({ isRead: true })
    .where(and(eq(notification.id, notificationId), eq(notification.userId, userId)))
    .returning();

  if (!result) {
    throw NotFoundError("Notification not found", "NOTIFICATION_NOT_FOUND");
  }
  return result;
};

export const markAllAsRead = async (userId: string): Promise<number> => {
  const result = await db
    .update(notification)
    .set({ isRead: true })
    .where(and(eq(notification.userId, userId), eq(notification.isRead, false)));
  return result.rowCount ?? 0;
};

export const deleteNotification = async (userId: string, notificationId: string): Promise<void> => {
  const [result] = await db
    .delete(notification)
    .where(and(eq(notification.id, notificationId), eq(notification.userId, userId)))
    .returning();

  if (!result) {
    throw NotFoundError("Notification not found", "NOTIFICATION_NOT_FOUND");
  }
};

export const deleteExpiredNotifications = async (): Promise<number> => {
  const now = new Date();
  const result = await db
    .delete(notification)
    .where(lt(notification.expiresAt, now));
  return result.rowCount ?? 0;
};

export const triggerTeamAddedNotification = async (
  userId: string,
  teamName: string,
  teamId: string
): Promise<void> => {
  await createAndSendNotification(
    userId,
    "Ditambahkan ke Tim",
    `Anda telah ditambahkan ke tim "${teamName}"`,
    "team_added",
    teamId,
    "team"
  );
};

export const triggerTaskAssignedNotification = async (
  userId: string,
  taskTitle: string,
  taskId: string,
  projectName: string
): Promise<void> => {
  await createAndSendNotification(
    userId,
    "Tugas Baru Diberikan",
    `Anda mendapat tugas "${taskTitle}" pada project "${projectName}"`,
    "task_assigned",
    taskId,
    "task"
  );
};

export const triggerTaskDeadlineApproachingNotification = async (
  userId: string,
  taskTitle: string,
  taskId: string,
  daysLeft: number
): Promise<void> => {
  await createAndSendNotification(
    userId,
    "Deadline Tugas Mendekat",
    `Tugas "${taskTitle}" akan jatuh tempo dalam ${daysLeft} hari`,
    "task_deadline_approaching",
    taskId,
    "task"
  );
};

export const triggerProjectDeadlineApproachingNotification = async (
  userId: string,
  projectName: string,
  projectId: string,
  daysLeft: number
): Promise<void> => {
  await createAndSendNotification(
    userId,
    "Deadline Project Mendekat",
    `Project "${projectName}" akan jatuh tempo dalam ${daysLeft} hari`,
    "project_deadline_approaching",
    projectId,
    "project"
  );
};

export const checkAndSendDeadlineNotifications = async (): Promise<void> => {
  const { task } = await import("../tasks/schema.js");
  const { project } = await import("../projects/schema.js");
  const { projectMember } = await import("../projects/schema.js");
  const { eq, and, lte, gte, sql } = await import("drizzle-orm");

  const now = new Date();
  const nowStr = now.toISOString().split("T")[0];
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const threeDaysLaterStr = threeDaysLater.toISOString().split("T")[0];

  const tasksDueSoon = await db
    .select({
      taskId: task.id,
      taskTitle: task.title,
      assigneeId: task.assigneeId,
      dueDate: task.dueDate,
      projectId: task.projectId,
    })
    .from(task)
    .where(
      and(
        eq(task.status, "todo"),
        lte(task.dueDate, threeDaysLaterStr),
        gte(task.dueDate, nowStr)
      )
    );

  for (const t of tasksDueSoon) {
    if (!t.dueDate || !t.assigneeId) continue;
    const diffDays = Math.ceil((new Date(t.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 3) {
      await triggerTaskDeadlineApproachingNotification(t.assigneeId, t.taskTitle, t.taskId, diffDays);
    }
  }

  const projectsDueSoon = await db
    .select({
      projectId: project.id,
      projectName: project.name,
      endDate: project.endDate,
      createdBy: project.createdBy,
    })
    .from(project)
    .where(
      and(
        inArray(project.status, ["planning", "in progress"]),
        lte(project.endDate, threeDaysLaterStr),
        gte(project.endDate, nowStr)
      )
    );

  for (const p of projectsDueSoon) {
    if (!p.endDate) continue;
    const diffDays = Math.ceil((new Date(p.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 3) {
      await triggerProjectDeadlineApproachingNotification(p.createdBy, p.projectName, p.projectId, diffDays);

      const members = await db
        .select({ userId: projectMember.userId })
        .from(projectMember)
        .where(eq(projectMember.projectId, p.projectId));

      for (const m of members) {
        if (m.userId !== p.createdBy) {
          await triggerProjectDeadlineApproachingNotification(m.userId, p.projectName, p.projectId, diffDays);
        }
      }
    }
  }
};

initializeFirebase();