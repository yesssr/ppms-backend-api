import { describe, test, expect } from "bun:test";
import { success, successWithMeta, error } from "../../src/utils/response";

describe("success", () => {
  test("returns success response with data and message", () => {
    const result = success({ id: 1 }, "ok");
    expect(result).toEqual({
      success: true,
      data: { id: 1 },
      message: "ok",
    });
  });

  test("message is optional", () => {
    const result = success("hello");
    expect(result).toEqual({
      success: true,
      data: "hello",
      message: undefined,
    });
  });
});

describe("successWithMeta", () => {
  test("returns success response with data, meta, and message", () => {
    const meta = { page: 1, limit: 10, total: 50, totalPages: 5 };
    const result = successWithMeta([1, 2], meta, "fetched");
    expect(result).toEqual({
      success: true,
      data: [1, 2],
      meta,
      message: "fetched",
    });
  });

  test("message is optional", () => {
    const meta = { page: 1, limit: 10, total: 0, totalPages: 1 };
    const result = successWithMeta([], meta);
    expect(result.message).toBeUndefined();
  });
});

describe("error", () => {
  test("returns error response with message and code", () => {
    const result = error("not found", "NOT_FOUND");
    expect(result).toEqual({
      success: false,
      error: {
        message: "not found",
        code: "NOT_FOUND",
        details: undefined,
      },
    });
  });

  test("includes details when provided", () => {
    const result = error("fail", "FAIL", { field: "name" });
    expect(result.error?.details).toEqual({ field: "name" });
  });

  test("code and details are optional", () => {
    const result = error("something broke");
    expect(result).toEqual({
      success: false,
      error: {
        message: "something broke",
        code: undefined,
        details: undefined,
      },
    });
  });
});
