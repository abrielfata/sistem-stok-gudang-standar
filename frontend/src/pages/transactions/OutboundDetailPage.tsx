import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { Check, X, Printer, ArrowLeft } from 'lucide-react';
import { formatDate, formatNumber } from '../../utils/formatters';
import { api } from '../../lib/api';

export const OutboundDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();

  const [so, setSo] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const loadSoDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await api.outbound.getById(id);
      if (res.success) {
        setSo(res.data);
      }
    } catch (err: any) {
      console.error(err);
      addToast({ type: 'error', message: 'Gagal memuat rincian dokumen Sales Order.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSoDetail();
  }, [id]);

  const handleConfirm = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const res = await api.outbound.confirm(id);
      if (res.success) {
        setShowConfirmModal(false);
        addToast({ type: 'success', message: 'Sales Order Berhasil Dikonfirmasi. Stok telah berkurang dari Gudang!' });
        loadSoDetail();
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Gagal mengonfirmasi dokumen Sales Order.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await api.outbound.cancel(id);
      setShowCancelModal(false);
      addToast({ type: 'success', message: 'Dokumen SO berhasil dibatalkan.' });
      loadSoDetail();
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Gagal membatalkan dokumen SO.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-text-muted">
        MEMUAT DOKUMEN SALES ORDER...
      </div>
    );
  }

  if (!so) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-3">
        <h2 className="text-lg font-bold text-status-danger">Dokumen Sales Order Tidak Ditemukan</h2>
        <Button variant="secondary" onClick={() => navigate('/outbound')}>
          KEMBALI KE DAFTAR OUTBOUND
        </Button>
      </div>
    );
  }

  const lines = so.lines || [];
  const totalQty = lines.reduce((acc: number, line: any) => acc + (line.qty || 0), 0);

  return (
    <div className="max-w-[900px] flex flex-col gap-4">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/outbound')} className="h-8 w-8 p-0">
            <ArrowLeft size={14} />
          </Button>
          <div>
            <div className="text-[11px] font-mono text-text-muted uppercase">
              BARANG KELUAR / {so.soNumber}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-mono font-bold text-text-primary">{so.soNumber}</span>
              <StatusBadge status={so.status} />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => window.print()} className="gap-1.5 font-mono text-xs">
            <Printer size={14} /> PRINT
          </Button>

          {so.status === 'DRAFT' && (
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
                <Check size={14} /> {isSubmitting ? 'MEMPROSES...' : 'KONFIRMASI (Keluarkan Stok)'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 2. Document Info Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface border border-border p-4 rounded-sm">
        <div>
          <span className="text-[10px] font-mono uppercase text-text-muted block">GUDANG ASAL</span>
          <span className="text-xs font-semibold text-text-primary mt-0.5 block">{so.warehouseName || '-'}</span>
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-text-muted block">PELANGGAN</span>
          <span className="text-xs font-semibold text-text-primary mt-0.5 block">{so.customerName || '-'}</span>
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-text-muted block">TANGGAL TRANSAKSI</span>
          <span className="text-xs font-mono text-text-primary mt-0.5 block">{formatDate(so.createdAt)}</span>
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-text-muted block">CATATAN</span>
          <span className="text-xs font-mono text-text-muted mt-0.5 block">{so.notes || '-'}</span>
        </div>
      </div>

      {/* 3. Line Items Table */}
      <div className="bg-surface border border-border rounded-sm overflow-hidden flex flex-col">
        <div className="px-4 py-2 border-b border-border bg-surface-subtle">
          <h2 className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider">
            RINCIAN BARANG KELUAR ({lines.length} ITEM)
          </h2>
        </div>

        <table className="w-full text-xs text-left">
          <thead className="border-b border-border bg-surface-subtle font-mono text-[11px] uppercase text-text-muted">
            <tr>
              <th className="px-4 py-2 w-12 text-center">#</th>
              <th className="px-4 py-2 w-36">SKU</th>
              <th className="px-4 py-2">NAMA BARANG</th>
              <th className="px-4 py-2 text-right w-28">QTY KELUAR</th>
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
        title="KONFIRMASI PENGIRIMAN BARANG"
        message="Stok barang akan otomatis berkurang dari Gudang asal. Tindakan ini tidak bisa dibatalkan."
        confirmText="YA, KELUARKAN STOK"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmModal(false)}
      />

      <ConfirmDialog
        isOpen={showCancelModal}
        title="BATALKAN DOKUMEN SALES ORDER"
        message="Dokumen ini akan ditandai CANCELLED dan tidak akan memengaruhi stok gudang."
        confirmText="YA, BATALKAN"
        onConfirm={handleCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
};

export default OutboundDetailPage;
