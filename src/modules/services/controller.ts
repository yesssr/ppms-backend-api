import { success, successWithMeta, error } from "../../utils/response.js";
import {
  getServices,
  getServiceById,
  createService as createServiceSvc,
  updateService as updateServiceSvc,
  deleteService as deleteServiceSvc,
} from "./service.js";
import { getPaginationParams } from "../../utils/pagination.js";
import type {
  ServicePaginationQuery,
  ServiceParams,
  ServiceBody,
  ServiceUpdateBody,
} from "./validation.js";

export async function listServices(context: { query: ServicePaginationQuery }) {
  try {
    const { page, limit } = getPaginationParams(
      context.query.page,
      context.query.limit
    );
    const result = await getServices({
      page,
      limit,
      search: context.query.search,
    });
    return successWithMeta(result.data, result.meta, "Services retrieved successfully");
  } catch (err) {
    return error("Failed to retrieve services", "FETCH_SERVICES_ERROR");
  }
}

export async function getService(context: { params: ServiceParams }) {
  try {
    const service = await getServiceById(context.params.id);
    return success(service, "Service retrieved successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Service not found", "SERVICE_NOT_FOUND");
    }
    return error("Failed to retrieve service", "FETCH_SERVICE_ERROR");
  }
}

export async function createService(context: { body: ServiceBody }) {
  try {
    const service = await createServiceSvc(context.body);
    return success(service, "Service created successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("unique")) {
      return error("Service name already exists", "SERVICE_NAME_EXISTS");
    }
    return error("Failed to create service", "CREATE_SERVICE_ERROR");
  }
}

export async function updateService(context: {
  params: ServiceParams;
  body: ServiceUpdateBody;
}) {
  try {
    const service = await updateServiceSvc(context.params.id, context.body);
    return success(service, "Service updated successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Service not found", "SERVICE_NOT_FOUND");
    }
    if (err instanceof Error && err.message.includes("unique")) {
      return error("Service name already exists", "SERVICE_NAME_EXISTS");
    }
    return error("Failed to update service", "UPDATE_SERVICE_ERROR");
  }
}

export async function deleteService(context: { params: ServiceParams }) {
  try {
    await deleteServiceSvc(context.params.id);
    return success(null, "Service deleted successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Service not found", "SERVICE_NOT_FOUND");
    }
    return error("Failed to delete service", "DELETE_SERVICE_ERROR");
  }
}
