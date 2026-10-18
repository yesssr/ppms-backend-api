import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { hashPassword } from "@better-auth/utils/password";
import { db } from "./index.js";
import { user, account } from "../modules/auth/schema.js";
import { createUser } from "../modules/users/service.js";

type SeedAccount = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "developer";
};

const accounts: SeedAccount[] = [
  {
    name: "Admin LEXA",
    email: "admin@lexa.com",
    password: "admin12345",
    role: "admin",
  },
  {
    name: "Developer LEXA",
    email: "developer@lexa.com",
    password: "developer12345",
    role: "developer",
  },
];

const findByEmail = async (email: string) => {
  const [row] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  return row;
};

// Reset the credential password so seed credentials stay deterministic.
const upsertCredentialPassword = async (userId: string, email: string, password: string) => {
  const hashed = await hashPassword(password);
  const [existing] = await db
    .select()
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "credential")))
    .limit(1);

  if (existing) {
    await db.update(account).set({ password: hashed }).where(eq(account.id, existing.id));
    return;
  }

  await db.insert(account).values({
    id: randomUUID(),
    accountId: email,
    providerId: "credential",
    userId,
    password: hashed,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);
};

const seed = async () => {
  for (const account of accounts) {
    const existing = await findByEmail(account.email);

    if (existing) {
      await db
        .update(user)
        .set({
          role: account.role,
          isActive: true,
          emailVerified: true,
        })
        .where(eq(user.id, existing.id));
      await upsertCredentialPassword(existing.id, account.email, account.password);
      console.log(`[seed] updated ${account.email} (role=${account.role}, isActive=true)`);
      continue;
    }

    await createUser({
      name: account.name,
      email: account.email,
      password: account.password,
      role: account.role,
      isActive: true,
    });

    const created = await findByEmail(account.email);
    if (created) {
      await db
        .update(user)
        .set({ emailVerified: true })
        .where(eq(user.id, created.id));
    }
    console.log(`[seed] created ${account.email} (role=${account.role})`);
  }

  console.log("[seed] done");
  process.exit(0);
};

seed().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
