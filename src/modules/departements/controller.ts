import { success, successWithMeta, error } from "../../utils/response.js";
import {
  getDepartments,
  getDepartmentById,
  createDepartment as createDepartmentSvc,
  updateDepartment as updateDepartmentSvc,
  deleteDepartment as deleteDepartmentSvc,
} from "./service.js";
import type { NewDepartment } from "./schema.js";
import { getPaginationParams } from "../../utils/pagination.js";
import type {
  DepartmentPaginationQuery,
  DepartmentParams,
  DepartmentBody,
  DepartmentUpdateBody,
} from "./validation.js";

export async function listDepartments(context: { query: DepartmentPaginationQuery }) {
  try {
    const { page, limit } = getPaginationParams(
      context.query.page,
      context.query.limit
    );
    const result = await getDepartments({ page, limit });
    return successWithMeta(
      result.data,
      result.meta,
      "Departments retrieved successfully"
    );
  } catch (err) {
    return error("Failed to retrieve departments", "FETCH_DEPARTMENTS_ERROR");
  }
}

export async function getDepartment(context: { params: DepartmentParams }) {
  try {
    const department = await getDepartmentById(context.params.id);
    return success(department, "Department retrieved successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Department not found", "DEPARTMENT_NOT_FOUND");
    }
    return error("Failed to retrieve department", "FETCH_DEPARTMENT_ERROR");
  }
}

export async function createDepartment(context: { body: DepartmentBody }) {
  try {
    const department = await createDepartmentSvc(context.body);
    return success(department, "Department created successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("unique")) {
      return error("Department name already exists", "DEPARTMENT_NAME_EXISTS");
    }
    return error("Failed to create department", "CREATE_DEPARTMENT_ERROR");
  }
}

export async function updateDepartment(context: {
  params: DepartmentParams;
  body: DepartmentUpdateBody;
}) {
  try {
    const department = await updateDepartmentSvc(
      context.params.id,
      context.body
    );
    return success(department, "Department updated successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Department not found", "DEPARTMENT_NOT_FOUND");
    }
    if (err instanceof Error && err.message.includes("unique")) {
      return error("Department name already exists", "DEPARTMENT_NAME_EXISTS");
    }
    return error("Failed to update department", "UPDATE_DEPARTMENT_ERROR");
  }
}

export async function deleteDepartment(context: { params: DepartmentParams }) {
  try {
    await deleteDepartmentSvc(context.params.id);
    return success(null, "Department deleted successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Department not found", "DEPARTMENT_NOT_FOUND");
    }
    return error("Failed to delete department", "DELETE_DEPARTMENT_ERROR");
  }
}
