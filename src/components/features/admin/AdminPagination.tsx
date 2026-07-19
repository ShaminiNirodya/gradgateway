"use client";

import { Button } from "@/components/ui/button";

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
};

export function AdminPagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  loading = false,
  onPageChange,
}: AdminPaginationProps) {
  if (totalCount === 0) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
      <p className="text-sm text-slate-500">
        Showing {start}–{end} of {totalCount}
      </p>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="rounded-lg"
          disabled={loading || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="text-sm font-medium text-slate-600">
          Page {page} of {Math.max(totalPages, 1)}
        </span>
        <Button
          size="sm"
          variant="outline"
          className="rounded-lg"
          disabled={loading || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
