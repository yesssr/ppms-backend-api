import type { Context } from "elysia";
import { auth } from "./auth.js";

/** Forward a raw request to the Better Auth fetch handler. */
const forward = (ctx: Context) => auth.handler(ctx.request);

export const signUpEmail = forward;
export const signInEmail = forward;
export const signOut = forward;
export const getSession = forward;
export const forgetPassword = forward;
export const resetPassword = forward;
export const verifyEmail = forward;
