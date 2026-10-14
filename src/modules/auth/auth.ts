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
      ? [config.app.FRONTEND_URL, config.app.BACKEND_URL]
      : [config.app.FRONTEND_URL, config.app.BACKEND_URL, "*"],
  advanced: {
    disableCSRFCheck: config.app.NODE_ENV !== "production",
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
  cookie: {
    name: "better-auth.session_token",
    secure: config.app.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
});

export const authPlugin = new Elysia({ name: "better-auth" }).mount(
  auth.handler
);
