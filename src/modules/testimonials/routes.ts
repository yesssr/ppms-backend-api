import { Elysia } from "elysia";
import { t } from "elysia";
import * as ctrl from "./controller.js";
import {
  testimonialPaginationQuery,
  testimonialParams,
  testimonialBody,
  updateTestimonialBody,
} from "./validation.js";
import { responses } from "../../docs/openapi.js";

export const testimonialRoutes = new Elysia({ name: "testimonials", prefix: "/api/testimonials" })
  .get("/", ctrl.listTestimonials, {
    query: testimonialPaginationQuery,
    response: responses.testimonialList,
    detail: {
      tags: ["Testimonials"],
      summary: "List testimonials",
      description: "Returns a paginated list of testimonials. **Developer (read).**",
      security: [{ sessionCookie: [] }],
    },
  })
  .get("/:id", ctrl.getTestimonial, {
    params: testimonialParams,
    response: responses.testimonial,
    detail: {
      tags: ["Testimonials"],
      summary: "Get a testimonial by ID",
      description: "Returns a single testimonial. **Developer (read).**",
      security: [{ sessionCookie: [] }],
    },
  })
  .post("/", ctrl.createTestimonial, {
    body: testimonialBody,
    response: responses.testimonial,
    detail: {
      tags: ["Testimonials"],
      summary: "Create a testimonial",
      description: "Creates a new testimonial. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .put("/:id", ctrl.updateTestimonial, {
    params: testimonialParams,
    body: updateTestimonialBody,
    response: responses.testimonial,
    detail: {
      tags: ["Testimonials"],
      summary: "Update a testimonial",
      description: "Updates an existing testimonial. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  })
  .delete("/:id", ctrl.deleteTestimonial, {
    params: testimonialParams,
    response: responses.deleted,
    detail: {
      tags: ["Testimonials"],
      summary: "Delete a testimonial",
      description: "Deletes a testimonial. **Admin only.**",
      security: [{ sessionCookie: [] }],
    },
  });
