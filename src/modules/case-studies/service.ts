import { db } from "../../db/index.js";
import { caseStudy, NewCaseStudy, CaseStudy } from "./schema.js";
import { eq, count } from "drizzle-orm";
import { NotFoundError } from "../../utils/errors.js";
import {
  PaginationParams,
  PaginatedResult,
  paginate,
  getPaginationOffset,
} from "../../utils/pagination.js";

export type { CaseStudy, NewCaseStudy } from "./schema.js";

export const getCaseStudies = async (
  params: PaginationParams
): Promise<PaginatedResult<CaseStudy>> => {
  const offset = getPaginationOffset(params.page, params.limit);

  const [items, countResult] = await Promise.all([
    db.select().from(caseStudy).limit(params.limit).offset(offset),
    db.select({ count: count() }).from(caseStudy),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return paginate(items, total, params);
};

export const getCaseStudyById = async (id: string): Promise<CaseStudy> => {
  const [result] = await db
    .select()
    .from(caseStudy)
    .where(eq(caseStudy.id, id))
    .limit(1);

  if (!result) {
    throw NotFoundError("Case study not found", "CASE_STUDY_NOT_FOUND");
  }

  return result;
};

export const createCaseStudy = async (
  data: NewCaseStudy
): Promise<CaseStudy> => {
  const [result] = await db.insert(caseStudy).values(data).returning();
  return result;
};

export const updateCaseStudy = async (
  id: string,
  data: Partial<NewCaseStudy>
): Promise<CaseStudy> => {
  const [result] = await db
    .update(caseStudy)
    .set(data)
    .where(eq(caseStudy.id, id))
    .returning();

  if (!result) {
    throw NotFoundError("Case study not found", "CASE_STUDY_NOT_FOUND");
  }

  return result;
};

export const deleteCaseStudy = async (id: string): Promise<void> => {
  const [result] = await db
    .delete(caseStudy)
    .where(eq(caseStudy.id, id))
    .returning();

  if (!result) {
    throw NotFoundError("Case study not found", "CASE_STUDY_NOT_FOUND");
  }
};
