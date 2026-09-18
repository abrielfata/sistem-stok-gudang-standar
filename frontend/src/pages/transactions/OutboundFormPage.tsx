import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../lib/api';

interface LineItem {
  productId: string;
  qty: number;
}

export const OutboundFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [warehouseId, setWarehouseId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineItem[]>([
    { productId: '', qty: 1 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadMasterData() {
      try {
        const [whRes, custRes, prodRes] = await Promise.all([
          api.warehouses.getAll(),
          api.customers.getAll(),
          api.products.getAll(),
        ]);
        if (whRes.success) setWarehouses(whRes.data || []);
        if (custRes.success) setCustomers(custRes.data || []);
        if (prodRes.success) setProducts(prodRes.data || []);
      } catch (err) {
        console.error('Failed to load master metadata', err);
      }
    }
    loadMasterData();
  }, []);

  const handleAddLine = () => {
    setLines([...lines, { productId: '', qty: 1 }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId || !customerId) {
      addToast({ type: 'error', message: 'Gudang Asal dan Customer wajib dipilih.' });
      return;
    }

    const validLines = lines.filter((l) => l.productId && l.qty > 0);
    if (validLines.length === 0) {
      addToast({ type: 'error', message: 'Pilih minimal satu barang dengan kuantitas lebih dari 0.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.outbound.create({
        warehouseId,
        customerId,
        notes,
        lines: validLines,
      });

      if (res.success) {
        addToast({ type: 'success', message: 'Dokumen Sales Order (SO) berhasil dibuat!' });
        const createdId = res.data?.id;
        if (createdId) {
          navigate(`/outbound/${createdId}`);
        } else {
          navigate('/outbound');
        }
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Gagal membuat dokumen Sales Order.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[850px] flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/outbound')} className="h-8 w-8 p-0">
            <ArrowLeft size={14} />
          </Button>
          <div>
            <div className="text-[11px] font-mono text-text-muted uppercase">TRANSAKSI / OUTBOUND</div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary uppercase">
              Buat Sales Order (Outbound)
            </h1>
          </div>
        </div>
        <Button variant="ghost" onClick={() => navigate('/outbound')} className="font-mono text-xs">
          BATAL
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-sm overflow-hidden flex flex-col gap-5 p-5">
        {/* Header Form Info */}
        <div className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider pb-2 border-b border-border">
          1. INFORMASI PENGIRIMAN & DOKUMEN
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Gudang Asal <span className="text-status-danger">*</span>
            </label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="h-9 px-3 bg-surface border border-border rounded-sm text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">PILIH GUDANG ASAL</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Pelanggan / Customer <span className="text-status-danger">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="h-9 px-3 bg-surface border border-border rounded-sm text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">PILIH CUSTOMER</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary">Catatan Transaksi</label>
          <input
            type="text"
            placeholder="Contoh: Pengiriman barang untuk Sales Order #20260901"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-9 px-3 bg-surface border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Line Items Table */}
        <div className="pt-2 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider">
              2. RINCIAN BARANG KELUAR
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={handleAddLine} className="gap-1 text-xs font-mono">
              <Plus size={14} /> TAMBAH BARIS
            </Button>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-surface-subtle font-mono text-[11px] uppercase text-text-muted">
              <tr>
                <th className="px-3 py-2 w-12 text-center">#</th>
                <th className="px-3 py-2">NAMA BARANG / SKU</th>
                <th className="px-3 py-2 w-32 text-right">QTY KELUAR</th>
                <th className="px-3 py-2 w-16 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-surface-subtle/50">
                  <td className="px-3 py-2 text-center font-mono text-text-muted">{idx + 1}</td>
                  <td className="px-3 py-2">
                    <select
                      value={line.productId}
                      onChange={(e) => handleLineChange(idx, 'productId', e.target.value)}
                      className="h-8 px-2 w-full bg-surface border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <option value="">PILIH BARANG</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} [{p.sku}] - Stok: {p.stock ?? 0}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={1}
                      value={line.qty}
                      onChange={(e) => handleLineChange(idx, 'qty', parseInt(e.target.value) || 0)}
                      className="h-8 px-2 w-full text-right bg-surface border border-border rounded-sm font-mono text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      disabled={lines.length === 1}
                      className="p-1 text-text-muted hover:text-status-danger disabled:opacity-30 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form Actions Footer */}
        <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate('/outbound')} className="font-mono text-xs" disabled={isSubmitting}>
            BATAL
          </Button>
          <Button type="submit" variant="primary" className="font-mono text-xs" disabled={isSubmitting}>
            {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN DRAFT SO'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OutboundFormPage;
