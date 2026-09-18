import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../lib/api';

interface LineItem {
  id: string;
  productId: string;
  qty: number;
}

export const InboundFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; sku: string }[]>([]);

  // Form Header State
  const [warehouseId, setWarehouseId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');

  // Line Items State
  const [lines, setLines] = useState<LineItem[]>([
    { id: Date.now().toString(), productId: '', qty: 1 }
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const [whRes, supRes, prodRes] = await Promise.all([
          api.warehouses.getAll(),
          api.suppliers.getAll(),
          api.products.getAll(),
        ]);

        if (whRes.success) setWarehouses(whRes.data || []);
        if (supRes.success) setSuppliers(supRes.data || []);
        if (prodRes.success) setProducts(prodRes.data || []);
      } catch (err: any) {
        console.error('Gagal memuat master data:', err);
        addToast({ type: 'error', message: 'Gagal memuat daftar gudang/supplier/barang.' });
      }
    }
    loadData();
  }, []);

  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      { id: Date.now().toString(), productId: '', qty: 1 }
    ]);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length === 1) {
      addToast({ type: 'error', message: 'Minimal harus ada 1 barang dalam daftar!' });
      return;
    }
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleUpdateLine = (id: string, field: 'productId' | 'qty', value: any) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id === id) {
          return {
            ...line,
            [field]: field === 'qty' ? Math.max(1, parseInt(value) || 1) : value,
          };
        }
        return line;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!warehouseId) {
      addToast({ type: 'error', message: 'Silakan pilih Gudang Penerima.' });
      return;
    }
    if (!supplierId) {
      addToast({ type: 'error', message: 'Silakan pilih Supplier/Pemasok.' });
      return;
    }

    // Validasi baris barang
    const validLines = lines.map((l) => ({
      productId: l.productId,
      qty: Number(l.qty),
    }));

    const hasEmptyProduct = validLines.some((l) => !l.productId);
    if (hasEmptyProduct) {
      addToast({ type: 'error', message: 'Pastikan seluruh baris barang sudah dipilih jenis produknya.' });
      return;
    }

    const productIds = validLines.map((l) => l.productId);
    const hasDuplicate = new Set(productIds).size !== productIds.length;
    if (hasDuplicate) {
      addToast({ type: 'error', message: 'Terdapat produk yang dipilih lebih dari satu kali. Mohon gabungkan kuantitasnya dalam 1 baris.' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        warehouseId,
        supplierId,
        notes: notes || undefined,
        lines: validLines,
      };

      const res = await api.inbound.create(payload);
      if (res.success) {
        addToast({ type: 'success', message: 'Draft GRN berhasil dibuat!' });
        const createdId = res.data?.id || '';
        if (createdId) {
          navigate(`/inbound/${createdId}`);
        } else {
          navigate('/inbound');
        }
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Gagal menyimpan dokumen GRN.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[900px] flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <div className="text-xs font-mono text-text-muted uppercase mb-0.5">
            Transaksi / Inbound
          </div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary uppercase">
            Buat Dokumen Penerimaan Barang (GRN)
          </h1>
        </div>
        <Button variant="ghost" onClick={() => navigate('/inbound')} className="gap-1 font-mono text-xs">
          <ArrowLeft size={14} />
          KEMBALI
        </Button>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Section 1: Informasi Header */}
        <div className="bg-surface border border-border p-5 rounded-sm flex flex-col gap-4">
          <div className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider pb-2 border-b border-border">
            1. INFORMASI SUMBER & TUJUAN
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">
                Gudang Penerima <span className="text-status-danger">*</span>
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="h-9 px-3 bg-surface border border-border rounded-sm text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">PILIH GUDANG TUJUAN</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">
                Supplier / Pemasok <span className="text-status-danger">*</span>
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="h-9 px-3 bg-surface border border-border rounded-sm text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">PILIH SUPPLIER PEMASOK</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">Catatan / Keterangan (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Pengiriman batch 1 melalui armada truk 02..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-9 px-3 bg-surface border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {/* Section 2: Detail Barang (Lines) */}
        <div className="bg-surface border border-border p-5 rounded-sm flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider">
              2. DAFTAR BARANG YANG DITERIMA ({lines.length} ITEM)
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleAddLine}
              className="gap-1 text-accent hover:bg-accent/10 font-mono text-xs h-7 px-2"
            >
              <Plus size={14} />
              TAMBAH BARIS BARANG
            </Button>
          </div>

          {/* Table Items */}
          <div className="border border-border rounded-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-text-muted font-mono uppercase text-[11px]">
                  <th className="p-3 w-12 text-center">NO</th>
                  <th className="p-3">BARANG / SKU</th>
                  <th className="p-3 w-36 text-right">KUANTITAS (QTY)</th>
                  <th className="p-3 w-16 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={line.id} className="border-b border-border last:border-0 hover:bg-surface-subtle/50">
                    <td className="p-3 text-center font-mono text-text-muted">{idx + 1}</td>
                    <td className="p-3">
                      <select
                        value={line.productId}
                        onChange={(e) => handleUpdateLine(line.id, 'productId', e.target.value)}
                        className="h-8 px-2 w-full bg-surface border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                      >
                        <option value="">PILIH BARANG DARI KATALOG</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.sku}] - {p.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="1"
                        value={line.qty}
                        onChange={(e) => handleUpdateLine(line.id, 'qty', e.target.value)}
                        className="h-8 px-2 w-full text-right font-mono bg-surface border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(line.id)}
                        className="p-1.5 text-text-muted hover:text-status-danger hover:bg-status-danger-bg rounded transition-colors"
                        title="Hapus Baris"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => navigate('/inbound')} className="font-mono text-xs">
            BATAL
          </Button>
          <Button type="submit" variant="primary" className="font-mono text-xs" disabled={loading}>
            {loading ? 'MENYIMPAN DRAFT...' : 'SIMPAN DRAFT GRN'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InboundFormPage;
