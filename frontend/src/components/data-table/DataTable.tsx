import React from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui/table';
import { Button } from '../ui/button';
import { RefreshCcw } from 'lucide-react';
import { DataTableEmpty } from './DataTableEmpty';

interface ColumnDef<T> {
  key: keyof T | string;
  header: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
  width?: string;
  isAction?: boolean;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading,
  isError,
  onRetry,
  emptyMessage,
  emptyActionLabel,
  onEmptyAction,
}: DataTableProps<T>) {
  if (isError) {
    return (
      <div className="w-full border border-status-danger bg-status-danger-bg py-8 px-4 flex flex-col items-center justify-center text-center rounded-sm">
        <p className="text-xs font-mono font-bold text-status-danger uppercase tracking-wider mb-3">
          Gagal memuat data. Coba lagi.
        </p>
        <Button variant="danger" size="sm" onClick={onRetry} className="gap-1.5 font-mono">
          <RefreshCcw size={13} />
          COBA LAGI
        </Button>
      </div>
    );
  }

  if (!isLoading && data.length === 0) {
    return (
      <DataTableEmpty
        message={emptyMessage}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead
              key={String(col.key)}
              style={{ width: col.width }}
              className={`text-${col.align || 'left'} ${col.isAction ? 'w-14' : ''}`}
            >
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          // Solid Block Skeleton (5 rows)
          Array.from({ length: 5 }).map((_, idx) => (
            <TableRow key={`skeleton-${idx}`}>
              {columns.map((col, cIdx) => (
                <TableCell key={`skel-col-${cIdx}`}>
                  <div className={`h-4 bg-border-strong rounded-sm w-${col.align === 'right' ? '16 ml-auto' : '3/4'}`}></div>
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          data.map((row, rowIdx) => (
            <TableRow key={row.id ?? rowIdx}>
              {columns.map((col) => (
                <TableCell
                  key={String(col.key)}
                  className={`text-${col.align || 'left'} ${col.isAction ? 'text-center' : ''}`}
                >
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
