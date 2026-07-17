import { db } from "../../db/index.js";
import { testimonial, NewTestimonial, Testimonial } from "./schema.js";
import { eq, count, ilike, or, and } from "drizzle-orm";
import { NotFoundError } from "../../utils/errors.js";
import {
  PaginationParams,
  PaginatedResult,
  paginate,
  getPaginationOffset,
} from "../../utils/pagination.js";

export type { Testimonial, NewTestimonial } from "./schema.js";

export const getTestimonials = async (
  params: PaginationParams & { search?: string; status?: string }
): Promise<PaginatedResult<Testimonial>> => {
  const offset = getPaginationOffset(params.page, params.limit);

  const conditions = [];

  if (params.search) {
    conditions.push(
      or(
        ilike(testimonial.clientName, `%${params.search}%`),
        ilike(testimonial.message, `%${params.search}%`)
      )
    );
  }

  if (params.status) {
    conditions.push(eq(testimonial.status, params.status));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, countResult] = await Promise.all([
    db.select().from(testimonial).where(whereClause).limit(params.limit).offset(offset),
    db.select({ count: count() }).from(testimonial).where(whereClause),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return paginate(items, total, params);
};

export const getTestimonialById = async (id: string): Promise<Testimonial> => {
  const [result] = await db.select().from(testimonial).where(eq(testimonial.id, id)).limit(1);

  if (!result) {
    throw NotFoundError("Testimonial not found", "TESTIMONIAL_NOT_FOUND");
  }

  return result;
};

export const createTestimonial = async (
  data: NewTestimonial
): Promise<Testimonial> => {
  const [result] = await db.insert(testimonial).values(data).returning();
  return result;
};

export const updateTestimonial = async (
  id: string,
  data: Partial<NewTestimonial>
): Promise<Testimonial> => {
  const [result] = await db.update(testimonial).set(data).where(eq(testimonial.id, id)).returning();

  if (!result) {
    throw NotFoundError("Testimonial not found", "TESTIMONIAL_NOT_FOUND");
  }

  return result;
};

export const deleteTestimonial = async (id: string): Promise<void> => {
  const [result] = await db.delete(testimonial).where(eq(testimonial.id, id)).returning();

  if (!result) {
    throw NotFoundError("Testimonial not found", "TESTIMONIAL_NOT_FOUND");
  }
};
