import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SimplePageProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  addLabel?: string;
  onAdd?: () => void;
}

export const SimplePage: React.FC<SimplePageProps> = ({ title, subtitle, icon: Icon, addLabel, onAdd }) => {
  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle mt-0.5">{subtitle}</p>
        </div>
        {addLabel && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 h-9 px-4 bg-accent text-white text-xs font-mono font-semibold rounded-sm hover:bg-accent/90 transition-colors"
          >
            <span className="text-base leading-none">+</span>
            {addLabel}
          </button>
        )}
      </div>

      <div className="flex-1 bg-surface border border-border rounded-sm flex flex-col items-center justify-center gap-3 text-center py-20">
        <div className="w-12 h-12 rounded-full bg-surface-subtle border border-border flex items-center justify-center">
          <Icon size={22} className="text-text-muted" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{title}</p>
          <p className="text-xs text-text-muted mt-0.5">Halaman ini sedang dalam pengembangan.</p>
        </div>
      </div>
    </div>
  );
};
