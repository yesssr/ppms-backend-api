import { describe, test, expect, mock, beforeEach } from "bun:test";
import { createChain, getSharedMockDb, clearMockDb } from "../../helpers/db-mock.js";

const mockDb = getSharedMockDb();

mock.module("../../../src/db/index.js", () => ({ db: getSharedMockDb() }));

const svc = await import("../../../src/modules/testimonials/service");

beforeEach(() => {
  clearMockDb(mockDb);
});

const fakeTestimonial = { id: "tm1", clientName: "Client", message: "Great work", rating: 5, status: "draft" };

describe("getTestimonials", () => {
  test("returns paginated testimonials", async () => {
    mockDb.select
      .mockImplementationOnce(() => createChain([fakeTestimonial]))
      .mockImplementationOnce(() => createChain([{ count: 1 }]));
    const result = await svc.getTestimonials({ page: 1, limit: 10 });
    expect(result.data).toEqual([fakeTestimonial]);
    expect(result.meta.total).toBe(1);
  });
});

describe("getTestimonialById", () => {
  test("returns testimonial when found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([fakeTestimonial]));
    const result = await svc.getTestimonialById("tm1");
    expect(result).toEqual(fakeTestimonial);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.select.mockImplementationOnce(() => createChain([]));
    await expect(svc.getTestimonialById("missing")).rejects.toThrow("Testimonial not found");
  });
});

describe("createTestimonial", () => {
  test("inserts and returns testimonial", async () => {
    mockDb.insert.mockImplementationOnce(() => createChain([fakeTestimonial]));
    const result = await svc.createTestimonial({ clientName: "C", message: "M", rating: 5, status: "draft" } as any);
    expect(result).toEqual(fakeTestimonial);
  });
});

describe("updateTestimonial", () => {
  test("updates and returns testimonial", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([fakeTestimonial]));
    const result = await svc.updateTestimonial("tm1", { message: "Updated" });
    expect(result).toEqual(fakeTestimonial);
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.update.mockImplementationOnce(() => createChain([]));
    await expect(svc.updateTestimonial("missing", {})).rejects.toThrow("Testimonial not found");
  });
});

describe("deleteTestimonial", () => {
  test("deletes successfully", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([{ id: "tm1" }]));
    await expect(svc.deleteTestimonial("tm1")).resolves.toBeUndefined();
  });

  test("throws NotFoundError when not found", async () => {
    mockDb.delete.mockImplementationOnce(() => createChain([]));
    await expect(svc.deleteTestimonial("missing")).rejects.toThrow("Testimonial not found");
  });
});
