import { Elysia } from "elysia";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "../../db/index.js";
import * as authSchema from "./schema.js";
import { config } from "../../config/conf.js";

export const auth = betterAuth({
  baseURL: config.auth.betterAuthUrl ?? "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  trustedOrigins: [config.app.FRONTEND_URL],
  secret: config.auth.betterAuthSecret,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
      },
      departmentId: {
        type: "string",
        required: false,
      },
      isActive: {
        type: "boolean",
      },
    },
  },
});

export const authPlugin = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });
        if (!session) return status(401);
        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });
