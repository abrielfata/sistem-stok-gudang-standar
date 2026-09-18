import React from 'react';
import { StatusBadge } from '../ui/StatusBadge';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TransactionItem {
  id: string;
  number: string;
  date: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
}

interface RecentTransactionsProps {
  title: string;
  items: TransactionItem[];
  linkTo: string;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ title, items, linkTo }) => {
  return (
    <div className="w-full flex flex-col bg-surface border border-border rounded-sm">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <h2 className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider">
          {title} TERBARU
        </h2>
        <Link 
          to={linkTo} 
          className="text-[10px] font-mono font-bold text-zinc-900 dark:text-zinc-100 hover:underline flex items-center gap-1 uppercase"
        >
          Lihat semua <ArrowRight size={12} />
        </Link>
      </div>

      <div className="p-0">
        {items.length === 0 ? (
          <div className="m-4 h-16 border border-dashed border-border flex items-center justify-center text-xs text-text-muted font-mono uppercase">
            Belum ada data
          </div>
        ) : (
          <table className="w-full text-xs text-left">
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-border/50 last:border-0 hover:bg-surface-subtle transition-colors">
                  <td className="px-4 py-2 font-mono font-bold text-text-primary w-[140px]">
                    {item.number}
                  </td>
                  <td className="px-4 py-2 font-mono text-text-muted">
                    {item.date}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
