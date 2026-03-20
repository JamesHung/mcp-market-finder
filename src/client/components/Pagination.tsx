interface PaginationProps {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
}: PaginationProps) {
  return (
    <nav className="pagination" aria-label="歷史列表分頁">
      <button
        className="secondary-button"
        type="button"
        disabled={!hasPreviousPage}
        onClick={() => onPageChange(page - 1)}
      >
        上一頁
      </button>
      <p className="pagination__summary">
        第 {page} 頁 / {Math.max(totalPages, 1)} 頁
      </p>
      <button
        className="secondary-button"
        type="button"
        disabled={!hasNextPage}
        onClick={() => onPageChange(page + 1)}
      >
        下一頁
      </button>
    </nav>
  );
}
