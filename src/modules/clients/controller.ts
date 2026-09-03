import { success, successWithMeta, error } from "../../utils/response.js";
import {
  getClients,
  getClientById,
  createClient as createClientSvc,
  updateClient as updateClientSvc,
  deleteClient as deleteClientSvc,
} from "./service.js";
import { getPaginationParams } from "../../utils/pagination.js";
import type {
  ClientPaginationQuery,
  ClientParams,
  ClientBody,
  ClientUpdateBody,
} from "./validation.js";

export async function listClients(context: { query: ClientPaginationQuery }) {
  try {
    const { page, limit } = getPaginationParams(
      context.query.page,
      context.query.limit
    );
    const result = await getClients({
      page,
      limit,
      search: context.query.search,
    });
    return successWithMeta(
      result.data,
      result.meta,
      "Clients retrieved successfully"
    );
  } catch (err) {
    return error("Failed to retrieve clients", "FETCH_CLIENTS_ERROR");
  }
}

export async function getClient(context: { params: ClientParams }) {
  try {
    const client = await getClientById(context.params.id);
    return success(client, "Client retrieved successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Client not found", "CLIENT_NOT_FOUND");
    }
    return error("Failed to retrieve client", "FETCH_CLIENT_ERROR");
  }
}

export async function createClient(context: { body: ClientBody }) {
  try {
    const client = await createClientSvc(context.body);
    return success(client, "Client created successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("unique")) {
      return error("Client name already exists", "CLIENT_NAME_EXISTS");
    }
    return error("Failed to create client", "CREATE_CLIENT_ERROR");
  }
}

export async function updateClient(context: {
  params: ClientParams;
  body: ClientUpdateBody;
}) {
  try {
    const client = await updateClientSvc(context.params.id, context.body);
    return success(client, "Client updated successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Client not found", "CLIENT_NOT_FOUND");
    }
    if (err instanceof Error && err.message.includes("unique")) {
      return error("Client name already exists", "CLIENT_NAME_EXISTS");
    }
    return error("Failed to update client", "UPDATE_CLIENT_ERROR");
  }
}

export async function deleteClient(context: { params: ClientParams }) {
  try {
    await deleteClientSvc(context.params.id);
    return success(null, "Client deleted successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Client not found", "CLIENT_NOT_FOUND");
    }
    return error("Failed to delete client", "DELETE_CLIENT_ERROR");
  }
}
