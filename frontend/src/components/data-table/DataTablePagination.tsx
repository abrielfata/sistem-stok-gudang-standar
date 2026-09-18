import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface DataTablePaginationProps {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const DataTablePagination: React.FC<DataTablePaginationProps> = ({
  page,
  perPage,
  total,
  totalPages,
  onPageChange,
}) => {
  if (total === 0) return null;

  const startIdx = (page - 1) * perPage + 1;
  const endIdx = Math.min(page * perPage, total);

  return (
    <div className="flex items-center justify-between py-2 border-t border-border mt-3 h-8">
      {/* Left Info */}
      <div className="text-[11px] text-text-muted font-mono uppercase tracking-wider">
        Menampilkan <strong className="text-text-primary">{startIdx}-{endIdx}</strong> dari <strong className="text-text-primary">{total}</strong>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft size={14} />
        </Button>
        <span className="px-3 h-7 flex items-center justify-center bg-surface border border-border font-bold text-text-primary text-xs font-mono rounded-sm">
          {page} / {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-7 w-7 p-0"
        >
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
};
