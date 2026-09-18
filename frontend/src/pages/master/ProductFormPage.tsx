import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../lib/api';

export const ProductFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; code?: string }[]>([]);
  const [uoms, setUoms] = useState<{ id: string; name: string }[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);

  const [form, setForm] = useState({
    sku: '',
    name: '',
    categoryId: '',
    uomId: '',
    minStock: 0,
    costPrice: 0,
    sellPrice: 0,
  });

  // Load dropdown categories, UOMs, and Total Products from backend
  useEffect(() => {
    async function loadMaster() {
      try {
        const [catRes, uomRes, prodRes] = await Promise.all([
          api.categories.getAll(),
          api.uoms.getAll(),
          api.products.getAll({ limit: 1 }), // Just to get total count
        ]);
        if (catRes.success) setCategories(catRes.data || []);
        if (uomRes.success) setUoms(uomRes.data || []);
        if (prodRes.success) {
          const total = prodRes.meta?.total || prodRes.data?.length || 0;
          setTotalProducts(total);
        }
      } catch (e) {
        console.error('Failed to load master metadata', e);
      }
    }
    loadMaster();
  }, []);

  // Load product to edit
  useEffect(() => {
    if (editId) {
      api.products.getById(editId).then((res) => {
        if (res.success && res.data) {
          const item = res.data;
          setForm({
            sku: item.sku || '',
            name: item.name || '',
            categoryId: item.categoryId || '',
            uomId: item.uomId || '',
            minStock: item.minStock || 0,
            costPrice: item.costPrice || 0,
            sellPrice: item.sellPrice || 0,
          });
        }
      }).catch(() => {
        addToast({ type: 'error', message: 'Gagal mengambil data barang.' });
      });
    }
  }, [editId]);

  const generateSkuString = (prefixRaw: string) => {
    const prefix = prefixRaw.replace(/^CAT-?/i, '').substring(0, 4).toUpperCase();
    
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const dateCode = `${dd}${mm}${yy}`;
    
    // Auto increment from total products
    const nextSeq = String(totalProducts + 1).padStart(4, '0');

    return `${prefix}-${dateCode}-${nextSeq}`;
  };

  const handleCategoryChange = (selectedId: string) => {
    const selectedCat = categories.find((c: any) => c.id === selectedId);
    let newSku = form.sku;

    if (selectedCat && !editId) {
      const rawCode = selectedCat.code || selectedCat.name;
      newSku = generateSkuString(rawCode);
    }

    setForm((prev) => ({
      ...prev,
      categoryId: selectedId,
      sku: newSku,
    }));
  };

  const handleManualGenerate = () => {
    const selectedCat = categories.find((c: any) => c.id === form.categoryId);
    const rawCode = selectedCat?.code || selectedCat?.name || 'PRD';
    
    const newSku = generateSkuString(rawCode);
    
    setForm((prev) => ({ ...prev, sku: newSku }));
    addToast({ type: 'success', message: `SKU berhasil dibuat: ${newSku}` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sku || !form.name) {
      addToast({ type: 'error', message: 'SKU dan Nama Barang wajib diisi.' });
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, any> = {
        sku: form.sku,
        name: form.name,
        minStock: Number(form.minStock) || 0,
        costPrice: Number(form.costPrice) || 0,
        sellPrice: Number(form.sellPrice) || 0,
      };

      if (form.categoryId) payload.categoryId = form.categoryId;
      if (form.uomId) payload.uomId = form.uomId;

      if (editId) {
        await api.products.update(editId, payload);
        addToast({ type: 'success', message: 'Data barang berhasil diperbarui!' });
      } else {
        await api.products.create(payload);
        addToast({ type: 'success', message: 'Barang baru berhasil ditambahkan!' });
      }
      navigate('/products');
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Gagal menyimpan barang ke database.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[800px] flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <div className="text-xs font-mono text-text-muted uppercase mb-0.5">
            Barang / {editId ? 'Edit' : 'Tambah'}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary uppercase">
            {editId ? 'Ubah Data Barang' : 'Tambah Barang Baru'}
          </h1>
        </div>
        <Button variant="ghost" onClick={() => navigate('/products')} className="font-mono text-xs">
          BATAL
        </Button>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-sm overflow-hidden flex flex-col">
        {/* Section 1: Informasi Utama */}
        <div className="p-5 flex flex-col gap-4">
          <div className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider pb-2 border-b border-border">
            1. INFORMASI IDENTITAS
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-text-secondary">
                  SKU <span className="text-status-danger">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleManualGenerate}
                  className="flex items-center gap-1 text-[11px] font-mono font-semibold text-accent hover:underline transition-colors"
                >
                  <span>🔄</span>
                  Auto SKU
                </button>
              </div>
              <input
                type="text"
                placeholder="Contoh: LPT-001"
                value={form.sku || ''}
                onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                className="h-9 px-3 bg-surface border border-border rounded-sm font-mono text-xs focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <span className="text-[11px] text-text-muted font-sans">Kode unik pengenal barang di gudang.</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">
                Nama Barang <span className="text-status-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Laptop Asus ExpertBook"
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-9 px-3 bg-surface border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">Kategori</label>
              <select
                value={form.categoryId || ''}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="h-9 px-3 bg-surface border border-border rounded-sm text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent uppercase"
              >
                <option value="">PILIH KATEGORI</option>
                {categories.map((c) => {
                  const prefix = c.code || c.name.substring(0, 3).toUpperCase();
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name.toUpperCase()} [Prefix: {prefix}]
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">Satuan (UoM)</label>
              <select
                value={form.uomId || ''}
                onChange={(e) => setForm({ ...form, uomId: e.target.value })}
                className="h-9 px-3 bg-surface border border-border rounded-sm text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent uppercase"
              >
                <option value="">PILIH SATUAN</option>
                {uoms.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Stok & Harga */}
        <div className="p-5 border-t border-border flex flex-col gap-4">
          <div className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider pb-2 border-b border-border">
            2. INVENTARIS & HARGA
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">Batas Minimum Stok</label>
              <input
                type="number"
                value={form.minStock ?? 0}
                onChange={(e) => setForm({ ...form, minStock: parseInt(e.target.value) || 0 })}
                className="h-9 px-3 bg-surface border border-border rounded-sm font-mono text-xs focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">Harga Beli (Rp)</label>
              <input
                type="number"
                value={form.costPrice ?? 0}
                onChange={(e) => setForm({ ...form, costPrice: parseFloat(e.target.value) || 0 })}
                className="h-9 px-3 bg-surface border border-border rounded-sm font-mono text-xs focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">Harga Jual (Rp)</label>
              <input
                type="number"
                value={form.sellPrice ?? 0}
                onChange={(e) => setForm({ ...form, sellPrice: parseFloat(e.target.value) || 0 })}
                className="h-9 px-3 bg-surface border border-border rounded-sm font-mono text-xs focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="px-5 py-3 border-t border-border bg-surface-subtle flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate('/products')} className="font-mono text-xs">
            BATAL
          </Button>
          <Button type="submit" variant="primary" className="font-mono text-xs" disabled={loading}>
            {loading ? 'MENYIMPAN...' : editId ? 'SIMPAN PERUBAHAN' : 'SIMPAN BARANG'}
          </Button>
        </div>
      </form>
    </div>
  );
};