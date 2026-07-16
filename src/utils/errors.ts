export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const BadRequestError = (message: string, code?: string) =>
  new HttpError(400, message, code);

export const UnauthorizedError = (message: string = "Unauthorized", code?: string) =>
  new HttpError(401, message, code);

export const ForbiddenError = (message: string = "Forbidden", code?: string) =>
  new HttpError(403, message, code);

export const NotFoundError = (message: string = "Not Found", code?: string) =>
  new HttpError(404, message, code);

export const ConflictError = (message: string, code?: string) =>
  new HttpError(409, message, code);

export const InternalServerError = (message: string = "Internal Server Error", code?: string) =>
  new HttpError(500, message, code);
