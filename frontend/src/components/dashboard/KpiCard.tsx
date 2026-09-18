import React from 'react';
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: 'increase' | 'decrease' | 'neutral';
  icon?: LucideIcon;
  isCurrency?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  delta,
  deltaType = 'neutral',
  icon: Icon,
}) => {
  const valueStr = String(value);
  const length = valueStr.length;
  
  // Dynamic font sizing for long numbers
  let valueSizeClass = 'text-[28px] sm:text-[30px]';
  if (length > 12) {
    valueSizeClass = 'text-[20px] sm:text-[22px]';
  } else if (length > 8) {
    valueSizeClass = 'text-[24px] sm:text-[26px]';
  }

  return (
    <div className="p-4 bg-surface border border-border flex flex-col justify-between rounded-sm min-w-0">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="card-label truncate pr-2">
          {label}
        </span>
        {Icon && <Icon size={14} className="text-text-muted flex-shrink-0" strokeWidth={1.75} />}
      </div>

      {/* Center Value */}
      <div className="my-2 min-w-0">
        <span 
          title={valueStr}
          className={cn(
            "font-semibold font-sans tabular-nums tracking-tight text-text-primary block truncate",
            valueSizeClass
          )}
        >
          {value}
        </span>
      </div>

      {/* Footer Delta */}
      <div className="flex items-center gap-1.5 kpi-subtext truncate">
        {delta ? (
          <>
            {deltaType === 'increase' && <ArrowUpRight size={13} strokeWidth={2.5} className="text-emerald-600 dark:text-emerald-500 flex-shrink-0" />}
            {deltaType === 'decrease' && <ArrowDownRight size={13} strokeWidth={2.5} className="text-red-600 dark:text-red-500 flex-shrink-0" />}
            <span className="text-text-primary truncate">{delta}</span>
            <span className="text-text-muted flex-shrink-0">vs hari lalu</span>
          </>
        ) : (
          <span className="text-text-muted">—</span>
        )}
      </div>
    </div>
  );
};
