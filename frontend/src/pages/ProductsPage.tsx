import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable } from '../components/data-table/DataTable';
import { DataTableToolbar } from '../components/data-table/DataTableToolbar';
import { DataTablePagination } from '../components/data-table/DataTablePagination';
import { formatRupiah, formatNumber } from '../utils/formatters';
import { useToast } from '../components/ui/Toast';
import { DeleteConfirmModal } from './master/DeleteConfirmModal';
import { api } from '../lib/api';

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  category?: { name: string };
  uomId?: string;
  uomName?: string;
  uom?: { name: string };
  minStock: number;
  stock: number;
  costPrice: number;
  sellPrice: number;
  status?: string;
}

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [data, setData] = useState<ProductItem[]>([]);
  const [total, setTotal] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State Delete Modal
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);

  // State Filter & Pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const loadData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await api.products.getAll({ search, page, limit: perPage });
      if (res.success) {
        setData(res.data || []);
        setTotal(res.meta?.total || (res.data || []).length);
      } else {
        throw new Error('Gagal memuat data');
      }
    } catch (err: any) {
      console.error(err);
      setIsError(true);
      // Auto-logout now handled globally in api.ts
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      const res = await api.products.delete(deletingProduct.id);
      if (res.success) {
        addToast({ type: 'success', message: `Barang "${deletingProduct.name}" berhasil dihapus.` });
        loadData();
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Gagal menghapus barang.' });
    } finally {
      setIsDeleting(false);
      setDeletingProduct(null);
    }
  };

  const columns = [
    {
      key: 'sku',
      header: 'SKU',
      width: '120px',
      render: (row: ProductItem) => (
        <span className="font-mono text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
          {row.sku}
        </span>
      ),
    },
    { 
      key: 'name', 
      header: 'NAMA BARANG',
      render: (row: ProductItem) => <span className="font-medium text-text-primary">{row.name}</span>
    },
    { 
      key: 'category', 
      header: 'KATEGORI', 
      width: '130px',
      render: (row: ProductItem) => <span className="text-text-muted text-xs">{row.categoryName || row.category?.name || '-'}</span> 
    },
    { 
      key: 'uom', 
      header: 'UOM', 
      width: '80px', 
      render: (row: ProductItem) => <span className="font-mono text-xs text-text-muted">{row.uomName || row.uom?.name || '-'}</span> 
    },
    { 
      key: 'minStock', 
      header: 'MIN', 
      align: 'right' as const, 
      width: '80px', 
      render: (row: ProductItem) => <span className="font-sans font-medium text-xs text-text-muted tabular-nums">{formatNumber(row.minStock)}</span> 
    },
    { 
      key: 'stock', 
      header: 'STOK', 
      align: 'right' as const, 
      width: '80px', 
      render: (row: ProductItem) => {
        const currentStock = row.stock || 0;
        const isLow = currentStock <= row.minStock;
        return (
          <span className={`font-sans text-xs font-semibold tabular-nums ${isLow ? 'text-status-danger' : 'text-zinc-800 dark:text-zinc-200'}`}>
            {formatNumber(currentStock)}
          </span>
        );
      }
    },
    { 
      key: 'costPrice', 
      header: 'HRG BELI', 
      align: 'right' as const, 
      width: '130px', 
      render: (row: ProductItem) => <span className="font-sans font-medium text-xs text-text-muted tabular-nums">{formatRupiah(row.costPrice)}</span> 
    },
    { 
      key: 'sellPrice', 
      header: 'HRG JUAL', 
      align: 'right' as const, 
      width: '130px', 
      render: (row: ProductItem) => <span className="font-sans font-semibold text-xs tabular-nums text-zinc-800 dark:text-zinc-200">{formatRupiah(row.sellPrice)}</span> 
    },
    { 
      key: 'status', 
      header: 'STATUS', 
      align: 'center' as const, 
      width: '110px', 
      render: (row: ProductItem) => <StatusBadge status={(row.status as any) || 'CONFIRMED'} /> 
    },
    { 
      key: 'actions', 
      header: 'AKSI', 
      isAction: true,
      align: 'center' as const,
      render: (row: ProductItem) => (
        <div className="flex items-center justify-center gap-1">
          <button 
            onClick={() => navigate(`/products/new?edit=${row.id}`)}
            className="p-1.5 text-text-muted hover:text-accent hover:bg-accent/10 rounded transition-colors" 
            title="Edit"
          >
            <Edit2 size={13} />
          </button>
          <button 
            onClick={() => setDeletingProduct(row)}
            className="p-1.5 text-text-muted hover:text-status-danger hover:bg-status-danger-bg rounded transition-colors" 
            title="Hapus"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ) 
    },
  ];

  return (
    <div className="flex flex-col h-full gap-3">
      {/* 1. Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Barang</h1>
            <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-mono text-text-muted uppercase">
              {total} BARANG
            </span>
          </div>
          <p className="page-subtitle mt-0.5">Kelola daftar SKU, harga, dan pengaturan stok minimal secara langsung dari database.</p>
        </div>
        <Button 
          variant="primary" 
          className="gap-1.5 font-mono text-xs"
          onClick={() => navigate('/products/new')}
        >
          <Plus size={15} />
          TAMBAH BARANG
        </Button>
      </div>

      {/* 2. Filter Bar */}
      <DataTableToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Cari SKU / nama barang..."
        filters={[]}
        hasActiveFilters={Boolean(search)}
        onReset={() => {
          setSearch('');
          setPage(1);
        }}
      />

      {/* 3. Table Wrapper */}
      <div className="flex-1 bg-surface border border-border rounded-sm flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            isError={isError}
            onRetry={loadData}
            emptyMessage="Belum ada barang di Database. Tambah barang pertama."
            emptyActionLabel="TAMBAH BARANG"
            onEmptyAction={() => navigate('/products/new')}
          />
        </div>
        
        {/* 4. Pagination */}
        {!isLoading && !isError && total > 0 && (
          <div className="px-4">
            <DataTablePagination
              page={page}
              perPage={perPage}
              total={total}
              totalPages={Math.ceil(total / perPage) || 1}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Hapus */}
      {deletingProduct && (
        <DeleteConfirmModal
          itemName={deletingProduct.name}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          onCancel={() => !isDeleting && setDeletingProduct(null)}
        />
      )}
    </div>
  );
};

export default ProductsPage;