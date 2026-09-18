import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { DataTable } from '../../components/data-table/DataTable';
import { DataTableToolbar } from '../../components/data-table/DataTableToolbar';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../lib/api';

export const CustomersPage: React.FC = () => {
  const { addToast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '',
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Delete State
  const [deletingItem, setDeletingItem] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.customers.getAll();
      if (res.success) setData(res.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const generateNextCode = () => {
    return `CUS-${Date.now().toString().slice(-4)}`;
  };

  const openAddModal = () => {
    setEditId(null);
    setForm({
      code: generateNextCode(),
      name: '',
      phone: '',
      email: '',
      address: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (row: any) => {
    setEditId(row.id);
    setForm({
      code: row.code || '',
      name: row.name || '',
      phone: row.phone || '',
      email: row.email || '',
      address: row.address || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) {
      addToast({ type: 'error', message: 'Nama, Telepon, dan Email wajib diisi.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = {
        code: form.code || generateNextCode(),
        name: form.name,
        phone: form.phone,
        email: form.email,
      };

      if (editId) {
        await api.customers.update(editId, payload);
        addToast({ type: 'success', message: 'Data berhasil diperbarui!' });
      } else {
        await api.customers.create(payload);
        addToast({ type: 'success', message: 'Data baru berhasil ditambahkan!' });
      }
      closeModal();
      loadData();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Gagal menyimpan data.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await api.customers.delete(deletingItem.id);
      addToast({ type: 'success', message: `Data "${deletingItem.name}" berhasil dihapus.` });
      loadData();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Gagal menghapus data.' });
    } finally {
      setIsDeleting(false);
      setDeletingItem(null);
    }
  };

  const filteredData = data.filter((item) => 
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      header: 'NAMA CUSTOMER',
      render: (row: any) => <span className="font-medium text-text-primary text-xs">{row.name || '-'}</span>
    },
    {
      key: 'phone',
      header: 'TELEPON',
      render: (row: any) => <span className="font-medium text-text-primary text-xs">{row.phone || '-'}</span>
    },
    {
      key: 'email',
      header: 'EMAIL',
      render: (row: any) => <span className="font-medium text-text-primary text-xs">{row.email || '-'}</span>
    },
    {
      key: 'actions',
      header: 'AKSI',
      isAction: true,
      align: 'center' as const,
      render: (row: any) => (
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => openEditModal(row)} className="p-1.5 text-text-muted hover:text-accent hover:bg-accent/10 rounded transition-colors" title="Edit">
            <Edit2 size={13} />
          </button>
          <button onClick={() => setDeletingItem(row)} className="p-1.5 text-text-muted hover:text-status-danger hover:bg-status-danger-bg rounded transition-colors" title="Hapus">
            <Trash2 size={13} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col h-full gap-3 relative">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Pelanggan (Customers)</h1>
            <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-mono text-text-muted uppercase">
              {filteredData.length} DATA
            </span>
          </div>
          <p className="page-subtitle mt-0.5">Daftar klien untuk transaksi barang keluar (SO).</p>
        </div>
        <Button variant="primary" onClick={openAddModal} className="gap-1.5 font-mono text-xs">
          <Plus size={15} />
          TAMBAH CUSTOMER
        </Button>
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari data..."
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
            emptyMessage="Belum ada data tercatat di sistem."
            onRetry={loadData}
          />
        </div>
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-sm w-full max-w-md shadow-xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-surface-subtle">
              <h2 className="font-bold text-text-primary text-sm uppercase">
                {editId ? 'Edit Data' : 'Tambah Data'}
              </h2>
              <button onClick={closeModal} className="text-text-muted hover:text-status-danger transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col p-5">
              
            <div className="flex flex-col gap-1.5 mb-3">
              <label className="text-xs font-medium text-text-secondary">
                Kode Customer (Auto)
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="h-9 px-3 w-full bg-surface border border-border rounded-sm text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, code: generateNextCode() })}
                  className="px-2.5 bg-surface-subtle border border-border rounded-sm text-xs font-mono text-text-muted hover:text-text-primary hover:bg-surface"
                  title="Generate Kode Baru"
                >
                  🔄
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mb-3">
              <label className="text-xs font-medium text-text-secondary">
                Nama Customer <span className="text-status-danger">*</span>
              </label>
              <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-9 px-3 w-full bg-surface border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                />
            </div>

            <div className="flex flex-col gap-1.5 mb-3">
              <label className="text-xs font-medium text-text-secondary">
                Telepon <span className="text-status-danger">*</span>
              </label>
              <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="h-9 px-3 w-full bg-surface border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                />
            </div>

            <div className="flex flex-col gap-1.5 mb-3">
              <label className="text-xs font-medium text-text-secondary">
                Email <span className="text-status-danger">*</span>
              </label>
              <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-9 px-3 w-full bg-surface border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                />
            </div>

            <div className="flex flex-col gap-1.5 mb-3">
              <label className="text-xs font-medium text-text-secondary">
                Alamat
              </label>
              <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="h-9 px-3 w-full bg-surface border border-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                />
            </div>
              <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-border">
                <Button type="button" variant="ghost" onClick={closeModal} className="text-xs font-mono" disabled={isSubmitting}>
                  BATAL
                </Button>
                <Button type="submit" variant="primary" className="text-xs font-mono" disabled={isSubmitting}>
                  {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletingItem && (
        <DeleteConfirmModal
          itemName={deletingItem.name}
          onConfirm={handleDelete}
          onCancel={() => !isDeleting && setDeletingItem(null)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};
