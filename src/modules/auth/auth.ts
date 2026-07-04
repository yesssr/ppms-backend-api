import { Elysia } from "elysia";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "../../db/index.js";
import * as authSchema from "./schema.js";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  trustedOrigins: [process.env.FRONTEND_URL ?? "http://localhost:5173"],
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "intern",
      },
    },
  },
});

export const authPlugin = new Elysia({ name: "better-auth" })
  .macro({
    auth: {
      async resolve({ request: { headers } }) {
        const session = await auth.api.getSession({ headers });
        if (!session) return new Response("Unauthorized", { status: 401 });
        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });
