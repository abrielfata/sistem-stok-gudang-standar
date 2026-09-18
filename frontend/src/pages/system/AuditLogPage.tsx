import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/data-table/DataTable';
import { DataTableToolbar } from '../../components/data-table/DataTableToolbar';
import { formatDate } from '../../utils/formatters';
import { api } from '../../lib/api';

export const AuditLogPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.audit.getAll();
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
      key: 'createdAt',
      header: 'WAKTU',
      width: '160px',
      render: (row: any) => (
        <span className="font-mono text-xs text-text-primary">
          {formatDate(row.createdAt || row.timestamp)}
        </span>
      )
    },
    {
      key: 'action',
      header: 'AKSI',
      width: '120px',
      render: (row: any) => (
        <span className="font-mono font-bold text-xs text-accent">
          {row.action || '-'}
        </span>
      )
    },
    {
      key: 'entity',
      header: 'ENTITAS',
      width: '120px',
      render: (row: any) => (
        <span className="font-mono text-xs font-semibold text-text-muted uppercase">
          {row.entity || '-'}
        </span>
      )
    },
    {
      key: 'description',
      header: 'DESKRIPSI HILIR AKSI',
      render: (row: any) => (
        <span className="font-sans text-xs text-text-primary">
          {row.description || `Operasi ${row.action} pada ${row.entity}`}
        </span>
      )
    }
  ];

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Audit Log Aktivitas</h1>
            <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-mono text-text-muted uppercase">
              {filteredData.length} LOGS
            </span>
          </div>
          <p className="page-subtitle mt-0.5">Rekam jejak setiap aksi pengguna dalam sistem (Security & Compliance Log).</p>
        </div>
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari berdasarkan aksi / entitas / deskripsi..."
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
            emptyMessage="Belum ada rekam jejak aktivitas tercatat."
            onRetry={loadData}
          />
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage;
