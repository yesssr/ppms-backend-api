import { Elysia } from "elysia";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "../../db/index.js";
import * as authSchema from "./schema.js";
import { config } from "../../config/conf.js";

export const auth = betterAuth({
  baseURL: config.auth.betterAuthUrl ?? `http://localhost:${config.app.PORT}`,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  trustedOrigins:
    config.app.NODE_ENV === "production"
      ? [config.app.FRONTEND_URL]
      : [config.app.FRONTEND_URL, "*"],
  advanced: {
    disableCSRFCheck: config.app.NODE_ENV !== "production", // menonaktifkan pengecekan Origin jika bukan di production
  },
  secret: config.auth.betterAuthSecret,
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
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

export const authPlugin = new Elysia({ name: "better-auth" }).mount(
  auth.handler
);
