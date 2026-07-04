import { Elysia, t } from "elysia";
import * as ctrl from "./controller.js";

// ─── Reusable schema fragments ───────────────────────────────────────────────

const emailPasswordBody = t.Object({
  email: t.String({ format: "email", example: "user@example.com" }),
  password: t.String({ minLength: 8, example: "s3cret!!" }),
});

const errorResponse = (description: string) => ({
  description,
  content: {
    "application/json": {
      schema: t.Object({
        message: t.String(),
        code: t.Optional(t.String()),
      }),
    },
  },
});

// ─── Plugin ──────────────────────────────────────────────────────────────────

export const authRoutes = new Elysia({ prefix: "/api/auth" })

  // ── Sign Up ────────────────────────────────────────────────────────────────
  .post(
    "/sign-up/email",
    ctrl.signUpEmail,
    {
      detail: {
        tags: ["Auth"],
        summary: "Register a new account",
        description:
          "Creates a new user account with email and password. " +
          "A verification email may be sent if email verification is enabled.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: emailPasswordBody } },
        },
        responses: {
          201: { description: "Account created" },
          400: errorResponse("Validation error or email already in use"),
          422: errorResponse("Invalid request body"),
        },
      },
    },
  )

  // ── Sign In ────────────────────────────────────────────────────────────────
  .post(
    "/sign-in/email",
    ctrl.signInEmail,
    {
      detail: {
        tags: ["Auth"],
        summary: "Sign in with email and password",
        requestBody: {
          required: true,
          content: { "application/json": { schema: emailPasswordBody } },
        },
        responses: {
          200: { description: "Signed in — session cookie set" },
          401: errorResponse("Invalid credentials"),
          403: errorResponse("Email not verified"),
        },
      },
    },
  )

  // ── Sign Out ───────────────────────────────────────────────────────────────
  .post(
    "/sign-out",
    ctrl.signOut,
    {
      detail: {
        tags: ["Auth"],
        summary: "End the current session",
        responses: {
          200: { description: "Signed out" },
        },
      },
    },
  )

  // ── Get Session ────────────────────────────────────────────────────────────
  .get(
    "/get-session",
    ctrl.getSession,
    {
      detail: {
        tags: ["Auth"],
        summary: "Return the current session and user",
        description:
          "Returns the authenticated user and session data if a valid session cookie is present.",
        responses: {
          200: {
            description: "Session data",
            content: {
              "application/json": {
                schema: t.Object({
                  user: t.Object({}, { additionalProperties: true }),
                  session: t.Object({}, { additionalProperties: true }),
                }),
              },
            },
          },
          401: errorResponse("No active session"),
        },
      },
    },
  )

  // ── Forgot Password ────────────────────────────────────────────────────────
  .post(
    "/forget-password",
    ctrl.forgetPassword,
    {
      detail: {
        tags: ["Auth"],
        summary: "Request a password-reset email",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: t.Object({
                email: t.String({ format: "email", example: "user@example.com" }),
              }),
            },
          },
        },
        responses: {
          200: { description: "Reset email sent if the account exists" },
        },
      },
    },
  )

  // ── Reset Password ─────────────────────────────────────────────────────────
  .post(
    "/reset-password",
    ctrl.resetPassword,
    {
      detail: {
        tags: ["Auth"],
        summary: "Reset password with a valid token",
        description:
          "The token is received via the password-reset email. Provide the new password.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: t.Object({
                token: t.String({ example: "abc123..." }),
                newPassword: t.String({ minLength: 8, example: "n3wP@ss!" }),
              }),
            },
          },
        },
        responses: {
          200: { description: "Password reset successful" },
          400: errorResponse("Invalid or expired token"),
        },
      },
    },
  )

  // ── Verify Email ───────────────────────────────────────────────────────────
  .get(
    "/verify-email",
    ctrl.verifyEmail,
    {
      detail: {
        tags: ["Auth"],
        summary: "Verify an email address using a token",
        description:
          "The token is typically sent via email after registration. Pass it as a query parameter.",
        query: t.Object({
          token: t.String({ example: "abc123..." }),
        }),
        responses: {
          200: { description: "Email verified" },
          400: errorResponse("Invalid or expired token"),
        },
      },
    },
  );
