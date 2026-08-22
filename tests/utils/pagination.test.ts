import { describe, test, expect } from "bun:test";
import {
  paginate,
  getPaginationParams,
  getPaginationOffset,
} from "../../src/utils/pagination";

describe("paginate", () => {
  test("returns data with correct meta", () => {
    const result = paginate([1, 2, 3], 10, { page: 1, limit: 3 });
    expect(result.data).toEqual([1, 2, 3]);
    expect(result.meta).toEqual({
      page: 1,
      limit: 3,
      total: 10,
      totalPages: 4,
    });
  });

  test("calculates totalPages with Math.ceil", () => {
    const result = paginate([], 10, { page: 1, limit: 3 });
    expect(result.meta.totalPages).toBe(4);
  });

  test("totalPages is at least 1 even with 0 items", () => {
    const result = paginate([], 0, { page: 1, limit: 10 });
    expect(result.meta.totalPages).toBe(1);
  });

  test("handles total less than limit", () => {
    const result = paginate([1], 1, { page: 1, limit: 10 });
    expect(result.meta.totalPages).toBe(1);
  });
});

describe("getPaginationParams", () => {
  test("returns defaults for undefined values", () => {
    expect(getPaginationParams(undefined, undefined)).toEqual({
      page: 1,
      limit: 10,
    });
  });

  test("clamps page to minimum 1", () => {
    expect(getPaginationParams(0, 10)).toEqual({ page: 1, limit: 10 });
    expect(getPaginationParams(-5, 10)).toEqual({ page: 1, limit: 10 });
  });

  test("clamps limit to max 100", () => {
    expect(getPaginationParams(1, 200)).toEqual({ page: 1, limit: 100 });
  });

  test("treats 0 limit as falsy, falls back to default", () => {
    expect(getPaginationParams(1, 0)).toEqual({ page: 1, limit: 10 });
  });

  test("handles NaN by falling back to defaults", () => {
    expect(getPaginationParams(NaN, NaN)).toEqual({ page: 1, limit: 10 });
  });

  test("passes through valid values", () => {
    expect(getPaginationParams(3, 25)).toEqual({ page: 3, limit: 25 });
  });
});

describe("getPaginationOffset", () => {
  test("returns 0 for page 1", () => {
    expect(getPaginationOffset(1, 10)).toBe(0);
  });

  test("calculates correct offset for page 2", () => {
    expect(getPaginationOffset(2, 10)).toBe(10);
  });

  test("calculates correct offset for page 5, limit 20", () => {
    expect(getPaginationOffset(5, 20)).toBe(80);
  });
});
