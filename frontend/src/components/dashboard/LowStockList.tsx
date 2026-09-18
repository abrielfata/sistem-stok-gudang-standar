import React from 'react';

interface LowStockItem {
  sku: string;
  name: string;
  stock: number;
  minStock: number;
}

interface LowStockListProps {
  items: LowStockItem[];
}

export const LowStockList: React.FC<LowStockListProps> = ({ items }) => {
  return (
    <div className="w-full h-full flex flex-col bg-surface border border-border rounded-sm">
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
        <h2 className="text-xs font-semibold text-status-danger uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-status-danger animate-pulse block"></span>
          LOW STOCK ALERT
        </h2>
        <span className="text-xs font-mono text-text-muted">{items.length} ITEM</span>
      </div>

      <div className="flex-1 p-2 overflow-y-auto">
        {items.length === 0 ? (
          <div className="w-full h-[200px] border border-dashed border-border flex items-center justify-center text-sm text-text-muted font-mono uppercase">
            Semua Stok Aman
          </div>
        ) : (
          <ul className="flex flex-col">
            {items.map((item, idx) => (
              <li 
                key={idx} 
                className="px-3 py-2.5 border-b border-border/50 last:border-b-0 hover:bg-surface-subtle transition-colors flex items-center justify-between"
              >
                <div className="flex flex-col truncate pr-2">
                  <span className="text-xs font-mono font-semibold text-text-primary truncate">
                    {item.sku}
                  </span>
                  <span className="text-xs text-text-secondary truncate mt-0.5 font-sans">
                    {item.name}
                  </span>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 font-sans text-xs">
                  <span className="text-status-danger font-semibold tabular-nums">
                    STOK: {item.stock}
                  </span>
                  <span className="text-text-muted tabular-nums">
                    MIN: {item.minStock}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
