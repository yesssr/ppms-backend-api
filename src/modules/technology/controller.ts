import { success, successWithMeta, error } from "../../utils/response.js";
import {
  getTechnologies,
  getTechnologyById,
  createTechnology as createTechnologySvc,
  updateTechnology as updateTechnologySvc,
  deleteTechnology as deleteTechnologySvc,
} from "./service.js";
import { getPaginationParams } from "../../utils/pagination.js";
import { TECH_CATEGORIES } from "../../constant/enum.js";
import type {
  TechnologyPaginationQuery,
  TechnologyParams,
  TechnologyBody,
  TechnologyUpdateBody,
} from "./validation.js";

export async function listTechnologies(context: { query: TechnologyPaginationQuery }) {
  try {
    const { page, limit } = getPaginationParams(
      context.query.page,
      context.query.limit
    );
    const result = await getTechnologies({
      page,
      limit,
      search: context.query.search,
      category: context.query.category,
    });
    return successWithMeta(result.data, result.meta, "Technologies retrieved successfully");
  } catch (err) {
    return error("Failed to retrieve technologies", "FETCH_TECHNOLOGIES_ERROR");
  }
}

export async function getTechnology(context: { params: TechnologyParams }) {
  try {
    const technology = await getTechnologyById(context.params.id);
    return success(technology, "Technology retrieved successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Technology not found", "TECHNOLOGY_NOT_FOUND");
    }
    return error("Failed to retrieve technology", "FETCH_TECHNOLOGY_ERROR");
  }
}

export async function createTechnology(context: { body: TechnologyBody }) {
  try {
    const body = context.body;
    if (!TECH_CATEGORIES.includes(body.category as (typeof TECH_CATEGORIES)[number])) {
      return error("Invalid technology category", "INVALID_TECHNOLOGY_CATEGORY");
    }
    const technology = await createTechnologySvc(body);
    return success(technology, "Technology created successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("unique")) {
      return error("Technology name already exists", "TECHNOLOGY_NAME_EXISTS");
    }
    return error("Failed to create technology", "CREATE_TECHNOLOGY_ERROR");
  }
}

export async function updateTechnology(context: {
  params: TechnologyParams;
  body: TechnologyUpdateBody;
}) {
  try {
    const body = context.body;
    if (body.category && !TECH_CATEGORIES.includes(body.category as (typeof TECH_CATEGORIES)[number])) {
      return error("Invalid technology category", "INVALID_TECHNOLOGY_CATEGORY");
    }
    const technology = await updateTechnologySvc(context.params.id, body);
    return success(technology, "Technology updated successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Technology not found", "TECHNOLOGY_NOT_FOUND");
    }
    if (err instanceof Error && err.message.includes("unique")) {
      return error("Technology name already exists", "TECHNOLOGY_NAME_EXISTS");
    }
    return error("Failed to update technology", "UPDATE_TECHNOLOGY_ERROR");
  }
}

export async function deleteTechnology(context: { params: TechnologyParams }) {
  try {
    await deleteTechnologySvc(context.params.id);
    return success(null, "Technology deleted successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Technology not found", "TECHNOLOGY_NOT_FOUND");
    }
    return error("Failed to delete technology", "DELETE_TECHNOLOGY_ERROR");
  }
}
