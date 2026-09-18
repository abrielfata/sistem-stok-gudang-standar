import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';

export interface FilterOption {
  key: string;
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}

interface DataTableToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onReset?: () => void;
  hasActiveFilters?: boolean;
}

export const DataTableToolbar: React.FC<DataTableToolbarProps> = ({
  search,
  onSearchChange,
  searchPlaceholder = 'Cari data...',
  filters = [],
  onReset,
  hasActiveFilters = false,
}) => {
  return (
    <div className="flex items-center justify-between gap-2 h-9">
      {/* Left: Search + Dropdowns */}
      <div className="flex items-center gap-2 flex-1">
        {/* Search Box (240px) */}
        <div className="relative w-[240px] h-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-full pl-8 pr-3 text-xs bg-surface border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 font-sans text-text-primary placeholder:text-text-muted"
          />
        </div>

        {/* Dynamic Compact Filters */}
        {filters.map((f) => (
          <select
            key={f.key}
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            className="h-full px-2.5 text-xs bg-surface border border-border rounded-sm font-sans text-text-secondary focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 uppercase"
          >
            <option value="">{f.label}: SEMUA</option>
            {f.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        {/* Reset Filter Button */}
        {hasActiveFilters && onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-full px-2 text-text-muted hover:text-text-primary gap-1 font-mono text-[11px]"
          >
            <RotateCcw size={12} />
            RESET
          </Button>
        )}
      </div>
    </div>
  );
};
