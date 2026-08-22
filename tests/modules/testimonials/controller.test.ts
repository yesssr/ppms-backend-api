import { describe, test, expect, mock, beforeEach } from "bun:test";

const mockGetTestimonials = mock(() => Promise.resolve({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } }));
const mockGetTestimonialById = mock(() => Promise.resolve({ id: "tm1", clientName: "C" }));
const mockCreateTestimonialSvc = mock(() => Promise.resolve({ id: "tm1" }));
const mockUpdateTestimonialSvc = mock(() => Promise.resolve({ id: "tm1" }));
const mockDeleteTestimonialSvc = mock(() => Promise.resolve());

mock.module("../../../src/modules/testimonials/service.js", () => ({
  getTestimonials: mockGetTestimonials,
  getTestimonialById: mockGetTestimonialById,
  createTestimonial: mockCreateTestimonialSvc,
  updateTestimonial: mockUpdateTestimonialSvc,
  deleteTestimonial: mockDeleteTestimonialSvc,
}));

const ctrl = await import("../../../src/modules/testimonials/controller");

beforeEach(() => {
  mockGetTestimonials.mockClear();
  mockGetTestimonialById.mockClear();
  mockCreateTestimonialSvc.mockClear();
  mockUpdateTestimonialSvc.mockClear();
  mockDeleteTestimonialSvc.mockClear();
});

describe("listTestimonials", () => {
  test("returns success", async () => {
    const result = await ctrl.listTestimonials({ query: { page: 1, limit: 10 } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns error on failure", async () => {
    mockGetTestimonials.mockRejectedValueOnce(new Error("db error"));
    const result = await ctrl.listTestimonials({ query: { page: 1, limit: 10 } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("getTestimonial", () => {
  test("returns success when found", async () => {
    const result = await ctrl.getTestimonial({ params: { id: "tm1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockGetTestimonialById.mockRejectedValueOnce(new Error("Testimonial not found"));
    const result = await ctrl.getTestimonial({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});

describe("createTestimonial", () => {
  test("creates testimonial", async () => {
    const result = await ctrl.createTestimonial({ body: { clientName: "C", message: "M", rating: 5, status: "draft" } as any });
    expect(result).toHaveProperty("success", true);
  });
});

describe("updateTestimonial", () => {
  test("updates testimonial", async () => {
    const result = await ctrl.updateTestimonial({ params: { id: "tm1" }, body: { message: "U" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockUpdateTestimonialSvc.mockRejectedValueOnce(new Error("Testimonial not found"));
    const result = await ctrl.updateTestimonial({ params: { id: "missing" }, body: {} });
    expect(result).toHaveProperty("success", false);
  });
});

describe("deleteTestimonial", () => {
  test("deletes successfully", async () => {
    const result = await ctrl.deleteTestimonial({ params: { id: "tm1" } });
    expect(result).toHaveProperty("success", true);
  });

  test("returns not-found error", async () => {
    mockDeleteTestimonialSvc.mockRejectedValueOnce(new Error("Testimonial not found"));
    const result = await ctrl.deleteTestimonial({ params: { id: "missing" } });
    expect(result).toHaveProperty("success", false);
  });
});
