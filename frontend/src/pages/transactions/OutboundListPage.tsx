import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '../../components/data-table/DataTable';
import { DataTableToolbar } from '../../components/data-table/DataTableToolbar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { api } from '../../lib/api';

export const OutboundListPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.outbound.getAll();
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
      key: 'soNumber',
      header: 'NOMOR SO',
      render: (row: any) => (
        <button
          onClick={() => navigate(`/outbound/${row.id}`)}
          className="font-mono font-bold text-xs text-accent hover:underline text-left"
        >
          {row.soNumber || '-'}
        </button>
      )
    },
    {
      key: 'customerName',
      header: 'PELANGGAN',
      render: (row: any) => <span className="font-medium text-text-primary text-xs">{row.customerName || '-'}</span>
    },
    {
      key: 'warehouseName',
      header: 'GUDANG ASAL',
      render: (row: any) => <span className="text-text-muted text-xs">{row.warehouseName || '-'}</span>
    },
    {
      key: 'createdAt',
      header: 'TANGGAL',
      render: (row: any) => <span className="font-mono text-xs">{formatDate(row.createdAt || row.date)}</span>
    },
    {
      key: 'status',
      header: 'STATUS',
      align: 'center' as const,
      render: (row: any) => <StatusBadge status={row.status || 'DRAFT'} />
    }
  ];

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Barang Keluar (Outbound SO)</h1>
            <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-mono text-text-muted uppercase">
              {filteredData.length} DOKUMEN
            </span>
          </div>
          <p className="page-subtitle mt-0.5">Pengeluaran barang dan Sales Order kepada pelanggan.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => navigate('/outbound/new')}
          className="gap-1.5 font-mono text-xs"
        >
          <Plus size={15} />
          BUAT SO BARU
        </Button>
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nomor dokumen / pelanggan..."
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
            emptyMessage="Belum ada transaksi barang keluar."
            emptyActionLabel="BUAT SO PERTAMA"
            onEmptyAction={() => navigate('/outbound/new')}
            onRetry={loadData}
          />
        </div>
      </div>
    </div>
  );
};

export default OutboundListPage;
