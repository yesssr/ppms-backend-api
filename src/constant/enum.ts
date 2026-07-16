export const TECH_CATEGORIES = [
  "frontend",
  "backend",
  "mobile",
  "devops",
  "database",
  "design",
  "testing",
] as const;

export type TechnologyCategory = (typeof TECH_CATEGORIES)[number];

export const USER_ROLES = ["admin", "developer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PROJECT_STATUS = [
  "planning",
  "in progress",
  "completed",
  "on hold",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUS)[number];

export const TASK_PRIORITY = ["low", "medium", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITY)[number];

export const TASK_STATUS = [
  "todo",
  "in progress",
  "in review",
  "done",
  "cancelled",
] as const;
export type TaskStatus = (typeof TASK_STATUS)[number];

export const DOCUMENT_CATEGORY = [
  "requirement",
  "design",
  "contract",
  "report",
  "other",
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORY)[number];

export const CONTENT_STATUS = ["draft", "published", "archived"] as const;
export type ContentStatus = (typeof CONTENT_STATUS)[number];
