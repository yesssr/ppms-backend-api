import { db } from "../../db/index.js";
import { Technology, NewTechnology, technology } from "./schema.js";
import { eq, count, ilike, and } from "drizzle-orm";
import { NotFoundError, ConflictError } from "../../utils/errors.js";
import {
  PaginationParams,
  PaginatedResult,
  paginate,
  getPaginationOffset,
} from "../../utils/pagination.js";

export type { Technology, NewTechnology } from "./schema.js";

export const getTechnologies = async (
  params: PaginationParams & { search?: string; category?: string }
): Promise<PaginatedResult<Technology>> => {
  const offset = getPaginationOffset(params.page, params.limit);

  const conditions = [];

  if (params.search) {
    conditions.push(ilike(technology.name, `%${params.search}%`));
  }

  if (params.category) {
    conditions.push(eq(technology.category, params.category));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, countResult] = await Promise.all([
    db.select().from(technology).where(whereClause).limit(params.limit).offset(offset),
    db.select({ count: count() }).from(technology).where(whereClause),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return paginate(items, total, params);
};

export const getTechnologyById = async (id: string): Promise<Technology> => {
  const [result] = await db.select().from(technology).where(eq(technology.id, id)).limit(1);

  if (!result) {
    throw NotFoundError("Technology not found", "TECHNOLOGY_NOT_FOUND");
  }

  return result;
};

export const createTechnology = async (
  data: NewTechnology
): Promise<Technology> => {
  const [result] = await db.insert(technology).values(data).returning();
  return result;
};

export const updateTechnology = async (
  id: string,
  data: Partial<NewTechnology>
): Promise<Technology> => {
  const [result] = await db.update(technology).set(data).where(eq(technology.id, id)).returning();

  if (!result) {
    throw NotFoundError("Technology not found", "TECHNOLOGY_NOT_FOUND");
  }

  return result;
};

export const deleteTechnology = async (id: string): Promise<void> => {
  const [result] = await db.delete(technology).where(eq(technology.id, id)).returning();

  if (!result) {
    throw NotFoundError("Technology not found", "TECHNOLOGY_NOT_FOUND");
  }
};
