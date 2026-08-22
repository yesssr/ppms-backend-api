import { describe, test, expect, mock, beforeEach } from "bun:test";

function createChain(result: unknown[] = []) {
  const makeChain = (r: unknown[]) => {
    const c: Record<string, unknown> = {};
    c.select = () => makeChain(r);
    c.from = () => makeChain(r);
    c.where = () => makeChain(r);
    c.limit = () => makeChain(r);
    c.offset = () => makeChain(r);
    c.orderBy = () => makeChain(r);
    c.innerJoin = () => makeChain(r);
    c.set = () => makeChain(r);
    c.values = () => makeChain(r);
    c.returning = () => makeChain(r);
    c.then = (resolve: (v: unknown) => void) => {
      resolve(r);
    };
    return c;
  };
  return makeChain(result);
}

const mockDb = {
  select: mock(() => createChain([])),
  insert: mock(() => createChain([])),
  update: mock(() => createChain([])),
  delete: mock(() => createChain([])),
};

mock.module("../../../src/db/index.js", () => ({ db: mockDb }));

const svc = await import("../../../src/modules/testimonials/service");

beforeEach(() => {
  mockDb.select.mockClear();
  mockDb.insert.mockClear();
  mockDb.update.mockClear();
  mockDb.delete.mockClear();
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
