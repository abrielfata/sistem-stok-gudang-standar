import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/data-table/DataTable';
import { formatDate, formatNumber } from '../../utils/formatters';
import { api } from '../../lib/api';

export const StockCardPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');

  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadMaster() {
      try {
        const [prodRes, whRes] = await Promise.all([
          api.products.getAll(),
          api.warehouses.getAll(),
        ]);
        if (prodRes.success && prodRes.data?.length) {
          setProducts(prodRes.data);
          setProductId(prodRes.data[0].id);
        }
        if (whRes.success && whRes.data?.length) {
          setWarehouses(whRes.data);
          setWarehouseId(whRes.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load master metadata', err);
      }
    }
    loadMaster();
  }, []);

  const loadStockCard = async () => {
    if (!productId || !warehouseId || productId === 'undefined' || warehouseId === 'undefined') {
      setData([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.inventory.getStockCard(productId, warehouseId);
      if (res.success) setData(res.data || []);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId && warehouseId) {
      loadStockCard();
    }
  }, [productId, warehouseId]);

  const columns = [
    {
      key: 'createdAt',
      header: 'TANGGAL & WAKTU',
      render: (row: any) => (
        <span className="font-mono text-xs text-text-primary">
          {formatDate(row.createdAt || row.date)}
        </span>
      )
    },
    {
      key: 'refType',
      header: 'DOKUMEN REF',
      render: (row: any) => (
        <span className="font-mono font-bold text-xs text-accent">
          {row.refType || 'MUTASI'} ({row.notes || '-'})
        </span>
      )
    },
    {
      key: 'type',
      header: 'MUTASI',
      align: 'center' as const,
      render: (row: any) => {
        const isIN = row.type === 'IN';
        return (
          <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${isIN ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
            {isIN ? `+${row.qty} IN` : `-${row.qty} OUT`}
          </span>
        );
      }
    },
    {
      key: 'balance',
      header: 'SALDO STOK',
      align: 'right' as const,
      render: (row: any) => (
        <span className="font-mono font-bold text-xs text-text-primary tabular-nums">
          {formatNumber(row.balance ?? row.qty ?? 0)}
        </span>
      )
    }
  ];

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Kartu Stok (Stock Ledger)</h1>
            <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-mono text-text-muted uppercase">
              {data.length} MUTASI
            </span>
          </div>
          <p className="page-subtitle mt-0.5">Audit trail riwayat pergerakan masuk-keluar barang per lokasi gudang.</p>
        </div>
      </div>

      {/* Dropdown Selectors */}
      <div className="bg-surface border border-border p-3 rounded-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-text-secondary">Pilih Barang (SKU)</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="h-9 px-3 bg-surface border border-border rounded-sm text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} [{p.sku}]
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-text-secondary">Pilih Gudang</label>
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="h-9 px-3 bg-surface border border-border rounded-sm text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-surface border border-border rounded-sm flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            emptyMessage="Belum ada riwayat mutasi stok untuk barang & gudang ini."
            onRetry={loadStockCard}
          />
        </div>
      </div>
    </div>
  );
};

export default StockCardPage;
