import React from 'react';
import { useLocation } from 'react-router-dom';

const PATH_NAME_MAP: Record<string, string> = {
  products: 'BARANG',
  categories: 'KATEGORI',
  uoms: 'SATUAN',
  warehouses: 'GUDANG',
  suppliers: 'SUPPLIER',
  customers: 'CUSTOMER',
  inventory: 'INVENTORY',
  stocks: 'STOK SAAT INI',
  'kartu-stok': 'KARTU STOK',
  inbound: 'INBOUND (GRN)',
  outbound: 'OUTBOUND (SO)',
  audit: 'AUDIT LOG',
  settings: 'PENGATURAN',
};

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return <span className="text-xs font-mono font-bold text-text-primary">DASHBOARD</span>;
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted">
      <span>WMS</span>
      {segments.map((seg, idx) => {
        const isLast = idx === segments.length - 1;
        const name = PATH_NAME_MAP[seg] || seg.toUpperCase();
        return (
          <React.Fragment key={seg}>
            <span className="text-border-strong">/</span>
            <span className={isLast ? "text-text-primary font-bold" : ""}>
              {name}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};
