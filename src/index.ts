import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authPlugin } from "./modules/auth/auth.js";

const app = new Elysia()
  .use(
    cors({
      origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .use(authPlugin)
  .get("/health", () => ({
    status: "ok",
  }))
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
