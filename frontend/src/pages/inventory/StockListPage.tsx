import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/data-table/DataTable';
import { DataTableToolbar } from '../../components/data-table/DataTableToolbar';
import { formatNumber } from '../../utils/formatters';
import { api } from '../../lib/api';

export const StockListPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.inventory.getStocks();
      if (res.success) setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = data.filter((item) => 
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'productSku',
      header: 'SKU',
      width: '130px',
      render: (row: any) => (
        <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
          {row.productSku || '-'}
        </span>
      )
    },
    {
      key: 'productName',
      header: 'NAMA BARANG',
      render: (row: any) => <span className="font-medium text-text-primary text-xs">{row.productName || '-'}</span>
    },
    {
      key: 'warehouseName',
      header: 'GUDANG LOKASI',
      render: (row: any) => <span className="text-text-muted text-xs">{row.warehouseName || '-'}</span>
    },
    {
      key: 'qtyAvailable',
      header: 'STOK TERSEDIA',
      align: 'right' as const,
      render: (row: any) => (
        <span className="font-mono text-xs font-bold text-accent tabular-nums">
          {formatNumber(row.qtyAvailable ?? row.quantity ?? 0)}
        </span>
      )
    }
  ];

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Stok Saat Ini (Per Gudang)</h1>
            <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-mono text-text-muted uppercase">
              {filteredData.length} LOKASI BARANG
            </span>
          </div>
          <p className="page-subtitle mt-0.5">Pemantauan ketersediaan fisik barang di setiap lokasi gudang secara real-time.</p>
        </div>
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari barang / SKU / gudang..."
        filters={[]}
        hasActiveFilters={Boolean(search)}
        onReset={() => setSearch('')}
      />

      <div className="flex-1 bg-surface border border-border rounded-sm flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <DataTable
            columns={columns}
            data={filteredData}
            isLoading={isLoading}
            emptyMessage="Belum ada data stok tercatat di sistem."
            onRetry={loadData}
          />
        </div>
      </div>
    </div>
  );
};

export default StockListPage;
