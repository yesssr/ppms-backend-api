import { success, successWithMeta, error } from "../../utils/response.js";
import {
  getUsers,
  getUserById,
  createUser as createUserSvc,
  updateUser as updateUserSvc,
  deleteUser as deleteUserSvc,
} from "./service.js";
import { getPaginationParams } from "../../utils/pagination.js";
import type {
  UserPaginationQuery,
  UserParams,
  CreateUserBody,
  UpdateUserBody,
} from "./validation.js";

export async function listUsers(context: { query: UserPaginationQuery }) {
  try {
    const { page, limit } = getPaginationParams(
      context.query.page,
      context.query.limit
    );
    const result = await getUsers({ page, limit });
    return successWithMeta(result.data, result.meta, "Users retrieved successfully");
  } catch (err) {
    return error("Failed to retrieve users", "FETCH_USERS_ERROR");
  }
}

export async function getUser(context: { params: UserParams }) {
  try {
    const user = await getUserById(context.params.id);
    return success(user, "User retrieved successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("User not found", "USER_NOT_FOUND");
    }
    return error("Failed to retrieve user", "FETCH_USER_ERROR");
  }
}

export async function createUser(context: { body: CreateUserBody }) {
  try {
    const body = context.body;
    const user = await createUserSvc({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role,
      departmentId: body.departmentId,
      isActive: body.isActive,
      teamIds: body.teamIds,
      projectIds: body.projectIds,
    });
    return success(user, "User created successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("unique")) {
      return error("Email already exists", "EMAIL_EXISTS");
    }
    return error("Failed to create user", "CREATE_USER_ERROR");
  }
}

export async function updateUser(context: {
  params: UserParams;
  body: UpdateUserBody;
}) {
  try {
    const user = await updateUserSvc(context.params.id, context.body);
    return success(user, "User updated successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("User not found", "USER_NOT_FOUND");
    }
    if (err instanceof Error && err.message.includes("unique")) {
      return error("Email already exists", "EMAIL_EXISTS");
    }
    return error("Failed to update user", "UPDATE_USER_ERROR");
  }
}

export async function deleteUser(context: { params: UserParams }) {
  try {
    await deleteUserSvc(context.params.id);
    return success(null, "User deleted successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("User not found", "USER_NOT_FOUND");
    }
    return error("Failed to delete user", "DELETE_USER_ERROR");
  }
}
