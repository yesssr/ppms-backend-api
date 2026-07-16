import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authPlugin } from "./modules/auth/auth.js";
import { config } from "./config/conf.js";
import { departmentRoutes } from "./modules/departements/routes.js";
import { serviceRoutes } from "./modules/services/routes.js";
import { technologyRoutes } from "./modules/technology/routes.js";
import { teamRoutes } from "./modules/teams/routes.js";
import { userRoutes } from "./modules/users/routes.js";
import { projectRoutes } from "./modules/projects/routes.js";
import { caseStudyRoutes } from "./modules/case-studies/routes.js";
import { testimonialRoutes } from "./modules/testimonials/routes.js";
import { taskRoutes } from "./modules/tasks/routes.js";
import { documentRoutes } from "./modules/documents/routes.js";
import { uploadRoutes } from "./modules/upload/routes.js";

const main = () => {
  const app = new Elysia();

  app.use(
    cors({
      origin: config.app.FRONTEND_URL,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(authPlugin);
  app.mount("/departments", departmentRoutes);
  app.mount("/services", serviceRoutes);
  app.mount("/technologies", technologyRoutes);
  app.mount("/teams", teamRoutes);
  app.mount("/users", userRoutes);
  app.mount("/projects", projectRoutes);
  app.mount("/case-studies", caseStudyRoutes);
  app.mount("/testimonials", testimonialRoutes);
  app.mount("/tasks", taskRoutes);
  app.mount("/documents", documentRoutes);
  app.mount("/upload", uploadRoutes);

  app.get("/health", () => ({
    status: "ok",
  }));

  const PORT = config.app.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
  });
};

main();
