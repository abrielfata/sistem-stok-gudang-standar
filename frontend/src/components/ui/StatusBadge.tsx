import React from 'react';
import { cn } from '../../lib/utils';

export type StatusType = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const normalized = (status || 'CONFIRMED').toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'CONFIRMED':
        return 'text-emerald-700 border-emerald-300 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950/40';
      case 'CANCELLED':
        return 'text-red-700 border-red-300 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950/40';
      case 'DRAFT':
      default:
        return 'text-slate-700 border-slate-300 bg-slate-50 dark:text-slate-300 dark:border-slate-700 dark:bg-slate-800/60';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-mono font-semibold text-xs tracking-wider uppercase px-2.5 py-0.5 rounded-[3px] border border-solid select-none',
        getStyle(),
        className
      )}
    >
      {normalized}
    </span>
  );
};
