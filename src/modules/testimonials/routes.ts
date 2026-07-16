import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  testimonialPaginationQuery,
  testimonialParams,
  testimonialBody,
  updateTestimonialBody,
} from "./validation.js";

export const testimonialRoutes = new Elysia({ name: "testimonials" })
  .get("/", ctrl.listTestimonials, { query: testimonialPaginationQuery })
  .get("/:id", ctrl.getTestimonial, { params: testimonialParams })
  .post("/", ctrl.createTestimonial, { body: testimonialBody })
  .put("/:id", ctrl.updateTestimonial, {
    params: testimonialParams,
    body: updateTestimonialBody,
  })
  .delete("/:id", ctrl.deleteTestimonial, { params: testimonialParams });
