export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Accepts either a legacy bare array or a paginated API response. */
export function unwrapPagedItems<T>(data: T[] | PagedResult<T> | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.items ?? [];
}

export function normalizePagedResult<T>(
  data: T[] | PagedResult<T> | null | undefined,
  fallbackPageSize = 20
): PagedResult<T> {
  if (!data) {
    return {
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: fallbackPageSize,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  if (Array.isArray(data)) {
    return {
      items: data,
      totalCount: data.length,
      page: 1,
      pageSize: data.length || fallbackPageSize,
      totalPages: data.length > 0 ? 1 : 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  const items = data.items ?? [];
  const totalCount = data.totalCount ?? items.length;
  const page = data.page ?? 1;
  const pageSize = data.pageSize ?? fallbackPageSize;
  const totalPages =
    data.totalPages ?? (pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0);

  return {
    items,
    totalCount,
    page,
    pageSize,
    totalPages,
    hasNextPage: data.hasNextPage ?? page < totalPages,
    hasPreviousPage: data.hasPreviousPage ?? page > 1,
  };
}

export function isPagedResult<T>(data: unknown): data is PagedResult<T> {
  return (
    !!data &&
    typeof data === 'object' &&
    'items' in data &&
    Array.isArray((data as PagedResult<T>).items)
  );
}
