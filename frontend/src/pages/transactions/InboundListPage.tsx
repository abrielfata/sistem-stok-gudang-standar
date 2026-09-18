import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable } from '../../components/data-table/DataTable';
import { DataTableToolbar } from '../../components/data-table/DataTableToolbar';
import { formatDate } from '../../utils/formatters';
import { api } from '../../lib/api';

export const InboundListPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.inbound.getAll();
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

  const filteredData = data.filter((item) => {
    const matchesSearch = JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || item.status === status;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'grnNumber',
      header: 'NOMOR GRN',
      width: '160px',
      render: (row: any) => (
        <button
          onClick={() => navigate(`/inbound/${row.id}`)}
          className="font-mono font-bold text-accent hover:underline text-left"
        >
          {row.grnNumber || '-'}
        </button>
      ),
    },
    {
      key: 'supplierName',
      header: 'SUPPLIER',
      render: (row: any) => <span className="font-medium text-text-primary text-xs">{row.supplierName || '-'}</span>,
    },
    {
      key: 'warehouseName',
      header: 'GUDANG',
      width: '160px',
      render: (row: any) => <span className="text-text-muted text-xs">{row.warehouseName || '-'}</span>,
    },
    {
      key: 'createdAt',
      header: 'TANGGAL',
      width: '140px',
      render: (row: any) => <span className="font-mono text-xs">{formatDate(row.createdAt || row.date)}</span>,
    },
    {
      key: 'status',
      header: 'STATUS',
      align: 'center' as const,
      width: '120px',
      render: (row: any) => <StatusBadge status={row.status || 'DRAFT'} />,
    },
  ];

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-semibold text-text-primary tracking-tight">Barang Masuk (Inbound GRN)</h1>
            <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-mono text-text-muted uppercase">
              {filteredData.length} DOKUMEN
            </span>
          </div>
          <p className="text-[13px] text-text-muted mt-0.5">Penerimaan barang dan penambahan stok via Goods Receipt Note (GRN).</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/inbound/new')} className="gap-1.5 font-mono text-xs">
          <Plus size={16} />
          BUAT GRN BARU
        </Button>
      </div>

      {/* Filter */}
      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nomor dokumen / supplier..."
        filters={[
          {
            key: 'status',
            label: 'STATUS',
            value: status,
            options: [
              { label: 'DRAFT', value: 'DRAFT' },
              { label: 'CONFIRMED', value: 'CONFIRMED' },
              { label: 'CANCELLED', value: 'CANCELLED' },
            ],
            onChange: setStatus,
          },
        ]}
        hasActiveFilters={Boolean(search || status)}
        onReset={() => {
          setSearch('');
          setStatus('');
        }}
      />

      {/* Table */}
      <div className="flex-1 bg-surface border border-border rounded-sm flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <DataTable
            columns={columns}
            data={filteredData}
            isLoading={isLoading}
            emptyMessage="Belum ada transaksi barang masuk."
            emptyActionLabel="BUAT GRN PERTAMA"
            onEmptyAction={() => navigate('/inbound/new')}
            onRetry={loadData}
          />
        </div>
      </div>
    </div>
  );
};

export default InboundListPage;
