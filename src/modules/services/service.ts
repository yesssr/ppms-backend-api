import { db } from "../../db/index.js";
import { services, NewService, Service } from "./schema.js";
import { eq, count, ilike, and } from "drizzle-orm";
import { NotFoundError } from "../../utils/errors.js";
import {
  PaginationParams,
  PaginatedResult,
  paginate,
  getPaginationOffset,
} from "../../utils/pagination.js";

export type { Service, NewService } from "./schema.js";

export const getServices = async (
  params: PaginationParams & { search?: string }
): Promise<PaginatedResult<Service>> => {
  const offset = getPaginationOffset(params.page, params.limit);

  const conditions = [];

  if (params.search) {
    conditions.push(ilike(services.name, `%${params.search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, countResult] = await Promise.all([
    db.select().from(services).where(whereClause).limit(params.limit).offset(offset),
    db.select({ count: count() }).from(services).where(whereClause),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return paginate(items, total, params);
};

export const getServiceById = async (id: string): Promise<Service> => {
  const [result] = await db.select().from(services).where(eq(services.id, id)).limit(1);

  if (!result) {
    throw NotFoundError("Service not found", "SERVICE_NOT_FOUND");
  }

  return result;
};

export const createService = async (data: NewService): Promise<Service> => {
  const [result] = await db.insert(services).values(data).returning();
  return result;
};

export const updateService = async (
  id: string,
  data: Partial<NewService>
): Promise<Service> => {
  const [result] = await db.update(services).set(data).where(eq(services.id, id)).returning();

  if (!result) {
    throw NotFoundError("Service not found", "SERVICE_NOT_FOUND");
  }

  return result;
};

export const deleteService = async (id: string): Promise<void> => {
  const [result] = await db.delete(services).where(eq(services.id, id)).returning();

  if (!result) {
    throw NotFoundError("Service not found", "SERVICE_NOT_FOUND");
  }
};
