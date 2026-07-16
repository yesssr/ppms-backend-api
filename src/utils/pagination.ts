export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const paginate = <T>(
  items: T[],
  total: number,
  params: PaginationParams
): PaginatedResult<T> => {
  const { page, limit } = params;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const getPaginationParams = (page?: number, limit?: number): PaginationParams => {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 10));
  return { page: p, limit: l };
};

export const getPaginationOffset = (page: number, limit: number): number => {
  return (page - 1) * limit;
};
