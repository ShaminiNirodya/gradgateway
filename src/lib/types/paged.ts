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

export function isPagedResult<T>(data: unknown): data is PagedResult<T> {
  return (
    !!data &&
    typeof data === 'object' &&
    'items' in data &&
    Array.isArray((data as PagedResult<T>).items)
  );
}
