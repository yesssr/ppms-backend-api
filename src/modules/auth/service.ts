import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { user } from "./schema.js";

/**
 * Auth service — business logic layer.
 *
 * Currently, authentication state and mutations are handled entirely by
 * Better Auth (see controller.ts).  This service is a placeholder for
 * custom business rules that sit on top of the auth tables (e.g. user
 * role escalations, account linking, audit logging).
 */

/** Fetch a single user by email. */
export const getUserByEmail = async (email: string) => {
  if (db instanceof Error) throw db;
  return db.query.user.findFirst({
    where: eq(user.email, email),
  });
};

/** Check whether a user exists by email. */
export const userExists = async (email: string): Promise<boolean> => {
  const u = await getUserByEmail(email);
  return u !== null;
};
