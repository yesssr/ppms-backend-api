import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authPlugin } from "./modules/auth/auth.js";

const main = () => {
  const app = new Elysia()
    .use(
      cors({
        origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    )
    .use(authPlugin);

  app.get("/health", () => ({
    status: "ok",
  }));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
  });
};

main();
