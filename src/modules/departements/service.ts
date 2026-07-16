import { db } from "../../db/index.js";
import { departments, NewDepartment, Department } from "./schema.js";
import { eq, count } from "drizzle-orm";
import { NotFoundError } from "../../utils/errors.js";
import {
  PaginationParams,
  paginate,
  getPaginationOffset,
  PaginatedResult,
} from "../../utils/pagination.js";

export const getDepartments = async (
  params: PaginationParams
): Promise<PaginatedResult<Department>> => {
  const offset = getPaginationOffset(params.page, params.limit);

  const [items, countResult] = await Promise.all([
    db.select().from(departments).limit(params.limit).offset(offset),
    db.select({ count: count() }).from(departments),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return paginate(items, total, params);
};

export const getDepartmentById = async (id: string): Promise<Department> => {
  const [result] = await db
    .select()
    .from(departments)
    .where(eq(departments.id, id))
    .limit(1);

  if (!result) {
    throw NotFoundError("Department not found", "DEPARTMENT_NOT_FOUND");
  }

  return result;
};

export const createDepartment = async (
  data: NewDepartment
): Promise<Department> => {
  const [result] = await db.insert(departments).values(data).returning();
  return result;
};

export const updateDepartment = async (
  id: string,
  data: Partial<NewDepartment>
): Promise<Department> => {
  const [result] = await db
    .update(departments)
    .set(data)
    .where(eq(departments.id, id))
    .returning();

  if (!result) {
    throw NotFoundError("Department not found", "DEPARTMENT_NOT_FOUND");
  }

  return result;
};

export const deleteDepartment = async (id: string): Promise<Department> => {
  const [result] = await db
    .delete(departments)
    .where(eq(departments.id, id))
    .returning();

  if (!result) {
    throw NotFoundError("Department not found", "DEPARTMENT_NOT_FOUND");
  }
  return result;
};
