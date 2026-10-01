type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center gap-6 md:mt-16">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded border border-border px-4 py-2 text-sm disabled:opacity-40"
      >
        Previous
      </button>
      <p className="text-sm text-muted">
        Page {page} of {pageCount}
      </p>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        className="rounded border border-border px-4 py-2 text-sm disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
