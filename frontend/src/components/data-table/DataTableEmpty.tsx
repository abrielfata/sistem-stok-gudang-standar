import React from 'react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

interface DataTableEmptyProps {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const DataTableEmpty: React.FC<DataTableEmptyProps> = ({
  message = 'Belum ada data.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="w-full border border-dashed border-border py-12 px-6 flex flex-col items-center justify-center text-center bg-surface-subtle/30 rounded-sm">
      <p className="text-xs font-mono uppercase text-text-muted mb-3 tracking-wider">
        {message}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="gap-1.5 font-mono">
          <Plus size={14} />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
