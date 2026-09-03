import { db } from "../../db/index.js";
import { clients, NewClient, Client } from "./schema.js";
import { eq, count, ilike, and } from "drizzle-orm";
import { NotFoundError } from "../../utils/errors.js";
import {
  PaginationParams,
  PaginatedResult,
  paginate,
  getPaginationOffset,
} from "../../utils/pagination.js";

export type { Client, NewClient } from "./schema.js";

export const getClients = async (
  params: PaginationParams & { search?: string }
): Promise<PaginatedResult<Client>> => {
  const offset = getPaginationOffset(params.page, params.limit);

  const conditions = [];

  if (params.search) {
    conditions.push(ilike(clients.name, `%${params.search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, countResult] = await Promise.all([
    db.select().from(clients).where(whereClause).limit(params.limit).offset(offset),
    db.select({ count: count() }).from(clients).where(whereClause),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return paginate(items, total, params);
};

export const getClientById = async (id: string): Promise<Client> => {
  const [result] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, id))
    .limit(1);

  if (!result) {
    throw NotFoundError("Client not found", "CLIENT_NOT_FOUND");
  }

  return result;
};

export const createClient = async (data: NewClient): Promise<Client> => {
  const [result] = await db.insert(clients).values(data).returning();
  return result;
};

export const updateClient = async (
  id: string,
  data: Partial<NewClient>
): Promise<Client> => {
  const [result] = await db
    .update(clients)
    .set(data)
    .where(eq(clients.id, id))
    .returning();

  if (!result) {
    throw NotFoundError("Client not found", "CLIENT_NOT_FOUND");
  }

  return result;
};

export const deleteClient = async (id: string): Promise<void> => {
  const [result] = await db.delete(clients).where(eq(clients.id, id)).returning();

  if (!result) {
    throw NotFoundError("Client not found", "CLIENT_NOT_FOUND");
  }
};
