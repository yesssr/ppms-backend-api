export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const success = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message,
  error: null,
});

export const successWithMeta = <T>(
  data: T,
  meta: PaginatedMeta,
  message?: string
): ApiResponse<T> => ({
  success: true,
  data,
  meta,
  message,
  error: null,
});

export const error = (
  message: string,
  code?: string,
  details?: unknown
): ApiResponse<never> => ({
  success: false,
  data: null,
  message,
  error: {
    message,
    code,
    details,
  },
  meta: null,
});
