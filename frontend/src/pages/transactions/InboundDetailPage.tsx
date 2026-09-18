import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { Check, X, Printer, ArrowLeft } from 'lucide-react';
import { formatDate, formatNumber } from '../../utils/formatters';
import { api } from '../../lib/api';

export const InboundDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();

  const [grn, setGrn] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const loadGrnDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await api.inbound.getById(id);
      if (res.success) {
        setGrn(res.data);
      }
    } catch (err: any) {
      console.error(err);
      addToast({ type: 'error', message: 'Gagal memuat rincian dokumen GRN.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGrnDetail();
  }, [id]);

  const handleConfirm = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const res = await api.inbound.confirm(id);
      if (res.success) {
        setShowConfirmModal(false);
        addToast({ type: 'success', message: 'GRN Berhasil Dikonfirmasi. Stok telah bertambah di Gudang!' });
        loadGrnDetail();
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Gagal mengonfirmasi dokumen GRN.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await api.inbound.cancel(id);
      setShowCancelModal(false);
      addToast({ type: 'success', message: 'Dokumen GRN berhasil dibatalkan.' });
      loadGrnDetail();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Gagal membatalkan dokumen GRN.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-text-muted">
        MEMUAT DOKUMEN GRN...
      </div>
    );
  }

  if (!grn) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-3">
        <h2 className="text-lg font-bold text-status-danger">Dokumen GRN Tidak Ditemukan</h2>
        <Button variant="secondary" onClick={() => navigate('/inbound')}>
          KEMBALI KE DAFTAR INBOUND
        </Button>
      </div>
    );
  }

  const lines = grn.lines || [];
  const totalQty = lines.reduce((acc: number, line: any) => acc + (line.qty || 0), 0);

  return (
    <div className="max-w-[900px] flex flex-col gap-4">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/inbound')} className="h-8 w-8 p-0">
            <ArrowLeft size={14} />
          </Button>
          <div>
            <div className="text-[11px] font-mono text-text-muted uppercase">
              BARANG MASUK / {grn.grnNumber}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-mono font-bold text-text-primary">{grn.grnNumber}</span>
              <StatusBadge status={grn.status} />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => window.print()} className="gap-1.5 font-mono text-xs">
            <Printer size={14} /> PRINT
          </Button>

          {grn.status === 'DRAFT' && (
            <>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowCancelModal(true)}
                className="gap-1.5 font-mono text-xs"
                disabled={isSubmitting}
              >
                <X size={14} /> BATALKAN
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowConfirmModal(true)}
                className="gap-1.5 font-mono text-xs"
                disabled={isSubmitting}
              >
                <Check size={14} /> {isSubmitting ? 'MEMPROSES...' : 'KONFIRMASI (MASUK STOK)'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 2. Document Info Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface border border-border p-4 rounded-sm">
        <div>
          <span className="text-[10px] font-mono uppercase text-text-muted block">GUDANG PENERIMA</span>
          <span className="text-xs font-semibold text-text-primary mt-0.5 block">{grn.warehouseName || '-'}</span>
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-text-muted block">SUPPLIER</span>
          <span className="text-xs font-semibold text-text-primary mt-0.5 block">{grn.supplierName || '-'}</span>
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-text-muted block">TANGGAL PENERIMAAN</span>
          <span className="text-xs font-mono text-text-primary mt-0.5 block">{formatDate(grn.createdAt)}</span>
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-text-muted block">CATATAN</span>
          <span className="text-xs font-mono text-text-muted mt-0.5 block">{grn.notes || '-'}</span>
        </div>
      </div>

      {/* 3. Line Items Table */}
      <div className="bg-surface border border-border rounded-sm overflow-hidden flex flex-col">
        <div className="px-4 py-2 border-b border-border bg-surface-subtle">
          <h2 className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider">
            RINCIAN BARANG MASUK ({lines.length} ITEM)
          </h2>
        </div>

        <table className="w-full text-xs text-left">
          <thead className="border-b border-border bg-surface-subtle font-mono text-[11px] uppercase text-text-muted">
            <tr>
              <th className="px-4 py-2 w-12 text-center">#</th>
              <th className="px-4 py-2 w-36">SKU</th>
              <th className="px-4 py-2">NAMA BARANG</th>
              <th className="px-4 py-2 text-right w-28">QTY MASUK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {lines.map((line: any, idx: number) => (
              <tr key={line.id || idx} className="hover:bg-surface-subtle">
                <td className="px-4 py-2.5 text-center font-mono text-text-muted">{idx + 1}</td>
                <td className="px-4 py-2.5 font-mono font-bold text-zinc-600 dark:text-zinc-400">{line.productSku || '-'}</td>
                <td className="px-4 py-2.5 font-medium text-text-primary">{line.productName || '-'}</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-text-primary tabular-nums">
                  {formatNumber(line.qty || 0)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-border bg-surface-subtle font-mono font-bold">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right uppercase text-[11px] text-text-muted">
                TOTAL KUANTITAS:
              </td>
              <td className="px-4 py-3 text-right text-sm text-accent tabular-nums">
                {formatNumber(totalQty)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Confirmation Modals */}
      <ConfirmDialog
        isOpen={showConfirmModal}
        title="KONFIRMASI PENERIMAAN BARANG"
        message="Stok barang akan otomatis ditambahkan ke Gudang penerima. Tindakan ini tidak bisa dibatalkan."
        confirmText="YA, MASUKKAN STOK"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmModal(false)}
      />

      <ConfirmDialog
        isOpen={showCancelModal}
        title="BATALKAN DOKUMEN GRN"
        message="Dokumen ini akan ditandai CANCELLED dan tidak akan memengaruhi stok gudang."
        confirmText="YA, BATALKAN"
        onConfirm={handleCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
};

export default InboundDetailPage;
