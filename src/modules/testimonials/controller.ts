import { success, successWithMeta, error } from "../../utils/response.js";
import {
  getTestimonials,
  getTestimonialById,
  createTestimonial as createTestimonialSvc,
  updateTestimonial as updateTestimonialSvc,
  deleteTestimonial as deleteTestimonialSvc,
} from "./service.js";
import { getPaginationParams } from "../../utils/pagination.js";
import type {
  TestimonialPaginationQuery,
  TestimonialParams,
  TestimonialBody,
  UpdateTestimonialBody,
} from "./validation.js";

export async function listTestimonials(context: { query: TestimonialPaginationQuery }) {
  try {
    const { page, limit } = getPaginationParams(
      context.query.page,
      context.query.limit
    );
    const result = await getTestimonials({ page, limit });
    return successWithMeta(result.data, result.meta, "Testimonials retrieved successfully");
  } catch (err) {
    return error("Failed to retrieve testimonials", "FETCH_TESTIMONIALS_ERROR");
  }
}

export async function getTestimonial(context: { params: TestimonialParams }) {
  try {
    const testimonial = await getTestimonialById(context.params.id);
    return success(testimonial, "Testimonial retrieved successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Testimonial not found", "TESTIMONIAL_NOT_FOUND");
    }
    return error("Failed to retrieve testimonial", "FETCH_TESTIMONIAL_ERROR");
  }
}

export async function createTestimonial(context: { body: TestimonialBody }) {
  try {
    const testimonial = await createTestimonialSvc(context.body);
    return success(testimonial, "Testimonial created successfully");
  } catch (err) {
    return error("Failed to create testimonial", "CREATE_TESTIMONIAL_ERROR");
  }
}

export async function updateTestimonial(context: {
  params: TestimonialParams;
  body: UpdateTestimonialBody;
}) {
  try {
    const testimonial = await updateTestimonialSvc(context.params.id, context.body);
    return success(testimonial, "Testimonial updated successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Testimonial not found", "TESTIMONIAL_NOT_FOUND");
    }
    return error("Failed to update testimonial", "UPDATE_TESTIMONIAL_ERROR");
  }
}

export async function deleteTestimonial(context: { params: TestimonialParams }) {
  try {
    await deleteTestimonialSvc(context.params.id);
    return success(null, "Testimonial deleted successfully");
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return error("Testimonial not found", "TESTIMONIAL_NOT_FOUND");
    }
    return error("Failed to delete testimonial", "DELETE_TESTIMONIAL_ERROR");
  }
}
