import { describe, test, expect } from "bun:test";
import {
  HttpError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
} from "../../src/utils/errors";

describe("HttpError", () => {
  test("creates error with statusCode, message, and code", () => {
    const err = new HttpError(418, "teapot", "TEAPOT");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(HttpError);
    expect(err.statusCode).toBe(418);
    expect(err.message).toBe("teapot");
    expect(err.code).toBe("TEAPOT");
    expect(err.name).toBe("HttpError");
  });

  test("code is optional", () => {
    const err = new HttpError(500, "oops");
    expect(err.code).toBeUndefined();
  });
});

describe("BadRequestError", () => {
  test("returns 400 with message and code", () => {
    const err = BadRequestError("invalid input", "VALIDATION");
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("invalid input");
    expect(err.code).toBe("VALIDATION");
  });

  test("code is optional", () => {
    const err = BadRequestError("bad");
    expect(err.code).toBeUndefined();
  });
});

describe("UnauthorizedError", () => {
  test("returns 401 with default message", () => {
    const err = UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("Unauthorized");
  });

  test("returns 401 with custom message", () => {
    const err = UnauthorizedError("token expired", "TOKEN_EXPIRED");
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("token expired");
    expect(err.code).toBe("TOKEN_EXPIRED");
  });
});

describe("ForbiddenError", () => {
  test("returns 403 with default message", () => {
    const err = ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe("Forbidden");
  });

  test("returns 403 with custom message", () => {
    const err = ForbiddenError("no access", "NO_ACCESS");
    expect(err.message).toBe("no access");
    expect(err.code).toBe("NO_ACCESS");
  });
});

describe("NotFoundError", () => {
  test("returns 404 with default message", () => {
    const err = NotFoundError();
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Not Found");
  });

  test("returns 404 with custom message and code", () => {
    const err = NotFoundError("User not found", "USER_NOT_FOUND");
    expect(err.message).toBe("User not found");
    expect(err.code).toBe("USER_NOT_FOUND");
  });
});

describe("ConflictError", () => {
  test("returns 409 with message and code", () => {
    const err = ConflictError("duplicate entry", "DUPLICATE");
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe("duplicate entry");
    expect(err.code).toBe("DUPLICATE");
  });
});

describe("InternalServerError", () => {
  test("returns 500 with default message", () => {
    const err = InternalServerError();
    expect(err.statusCode).toBe(500);
    expect(err.message).toBe("Internal Server Error");
  });

  test("returns 500 with custom message", () => {
    const err = InternalServerError("crash", "CRASH");
    expect(err.message).toBe("crash");
    expect(err.code).toBe("CRASH");
  });
});
