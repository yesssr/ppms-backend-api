import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { hashPassword } from "@better-auth/utils/password";
import { db } from "./index.js";
import { user, account } from "../modules/auth/schema.js";
import { createUser } from "../modules/users/service.js";
import { services } from "../modules/services/schema.js";
import { technology } from "../modules/technology/schema.js";
import { departments } from "../modules/departements/schema.js";
import { clients } from "../modules/clients/schema.js";
import { team } from "../modules/teams/schema.js";

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

const baseServices = [
  { name: "Web Development", description: "High-performance, secure and responsive web applications built with a modern architecture.", isActive: true },
  { name: "Mobile App Development", description: "Native and cross-platform mobile applications for iOS and Android.", isActive: true },
  { name: "UI/UX Design", description: "User research, wireframing, prototyping, and stunning interface design.", isActive: true },
  { name: "System Integration", description: "Enterprise system integration, API development, database migration, and backend optimization.", isActive: true },
];

const baseTechnologies = [
  { name: "React", category: "frontend" },
  { name: "Next.js", category: "frontend" },
  { name: "Vue.js", category: "frontend" },
  { name: "TypeScript", category: "frontend" },
  { name: "Node.js", category: "backend" },
  { name: "Laravel", category: "backend" },
  { name: "PostgreSQL", category: "database" },
  { name: "MySQL", category: "database" },
  { name: "Flutter", category: "mobile" },
  { name: "React Native", category: "mobile" },
  { name: "Docker", category: "devops" },
  { name: "Figma", category: "design" },
  { name: "Jest", category: "testing" },
];

const baseDepartments = [
  { name: "UI/UX", description: "User interface and experience design." },
  { name: "Front End", description: "Client-side web and mobile development." },
  { name: "Back End", description: "Server-side services, APIs, and databases." },
  { name: "QA Testing", description: "Quality assurance and automated testing." },
  { name: "DevOps", description: "Build, deployment, and infrastructure." },
  { name: "Project Management", description: "Planning, coordination, and delivery." },
];

const baseClients = [
  { name: "PT Digital Nusantara", email: "contact@digitalnusantara.id", phone: "+62 811 2345 6789", address: "Jakarta Selatan" },
  { name: "CV Maju Bersama", email: "info@majubersama.co.id", phone: "+62 812 9876 5432", address: "Bandung" },
  { name: "Bank Mandiri", email: "corporate@bankmandiri.co.id", phone: "+62 21 526 5045", address: "Jakarta Pusat" },
  { name: "Telkom Indonesia", email: "partnership@telkom.co.id", phone: "+62 21 521 5115", address: "Bandung" },
];

const baseTeams = [
  { name: "Team Alpha", description: "Web development squad." },
  { name: "Team Beta", description: "Mobile development squad." },
  { name: "Team Gamma", description: "System development squad." },
];

// Insert reference/base data. Uses ON CONFLICT DO NOTHING on the unique `name`
// column so the seed stays idempotent and never overwrites edited rows.
const seedBaseData = async () => {
  const inserted = await db
    .insert(services)
    .values(baseServices)
    .onConflictDoNothing({ target: services.name })
    .returning({ id: services.id });
  console.log(`[seed] services ready (${inserted.length} inserted)`);

  const techs = await db
    .insert(technology)
    .values(baseTechnologies)
    .onConflictDoNothing({ target: technology.name })
    .returning({ id: technology.id });
  console.log(`[seed] technologies ready (${techs.length} inserted)`);

  const depts = await db
    .insert(departments)
    .values(baseDepartments)
    .onConflictDoNothing({ target: departments.name })
    .returning({ id: departments.id });
  console.log(`[seed] departments ready (${depts.length} inserted)`);

  const clientRows = await db
    .insert(clients)
    .values(baseClients)
    .onConflictDoNothing({ target: clients.name })
    .returning({ id: clients.id });
  console.log(`[seed] clients ready (${clientRows.length} inserted)`);

  const teamRows = await db
    .insert(team)
    .values(baseTeams)
    .onConflictDoNothing({ target: team.name })
    .returning({ id: team.id });
  console.log(`[seed] teams ready (${teamRows.length} inserted)`);
};

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

export const seed = async () => {
  await seedBaseData();

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
};

if (import.meta.main) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[seed] failed", err);
      process.exit(1);
    });
}
